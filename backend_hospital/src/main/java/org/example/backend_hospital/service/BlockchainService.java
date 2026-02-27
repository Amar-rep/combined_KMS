package org.example.backend_hospital.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.example.backend_hospital.config.AppConfig;
import org.example.backend_hospital.dto.BlockchainReceiptDTO;
import org.example.backend_hospital.exception.BlockchainException;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.*;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.*;
import org.web3j.protocol.http.HttpService;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class BlockchainService {

    // ── Config ────────────────────────────────────────────────────────────────

    private final AppConfig appConfig;
    private Web3j web3j;
    private Credentials credentials;
    private String contractAddress;

    @PostConstruct
    public void init() {
        AppConfig.Blockchain bc = appConfig.getBlockchain();
        if (bc == null)
            return;

        if (bc.getNodeUrl() != null && !bc.getNodeUrl().isEmpty()) {
            this.web3j = Web3j.build(new HttpService(bc.getNodeUrl()));
            log.info("Connected to blockchain node: {}", bc.getNodeUrl());
        }

        if (bc.getPrivateKey() != null && !bc.getPrivateKey().isEmpty()) {
            this.credentials = Credentials.create(bc.getPrivateKey());
            log.info("Loaded credentials for address: {}", credentials.getAddress());
        }

        this.contractAddress = bc.getContractAddress();
    }

    // ── Public API ────────────────────────────────────────────────────────────

    public BlockchainReceiptDTO registerUser(String userId, String role, boolean isActive, String meta)
            throws Exception {
        Function function = new Function(
                "registerUser",
                Arrays.asList(
                        stringToBytes32(userId),
                        stringToBytes32(role),
                        new Bool(isActive),
                        new Utf8String(meta)),
                Collections.emptyList());
        return sendAndDecode(function);
    }

    public BlockchainReceiptDTO addRecord(String recordId, String patientId, String documentHash, String ipfsCid)
            throws Exception {
        Function function = new Function(
                "addRecord",
                Arrays.asList(
                        stringToBytes32(recordId),
                        stringToBytes32(patientId),
                        stringToBytes32(documentHash),
                        new Utf8String(ipfsCid)),
                Collections.emptyList());
        return sendAndDecode(function);
    }

    public BlockchainReceiptDTO grantAccess(String recordId, String doctorId) throws Exception {
        Function function = new Function(
                "grantAccess",
                Arrays.asList(
                        stringToBytes32(recordId),
                        stringToBytes32(doctorId)),
                Collections.emptyList());
        return sendAndDecode(function);
    }

    public BlockchainReceiptDTO revokeAccess(String recordId, String doctorId) throws Exception {
        Function function = new Function(
                "revokeAccess",
                Arrays.asList(
                        stringToBytes32(recordId),
                        stringToBytes32(doctorId)),
                Collections.emptyList());
        return sendAndDecode(function);
    }

    public boolean canView(String recordId, String viewerId) throws Exception {
        assertConfigured();

        Function function = new Function(
                "canView",
                Arrays.asList(
                        stringToBytes32(recordId),
                        stringToBytes32(viewerId)),
                Collections.singletonList(new TypeReference<Bool>() {
                }));

        String encodedFunction = FunctionEncoder.encode(function);
        Transaction transaction = Transaction.createEthCallTransaction(
                credentials.getAddress(),
                contractAddress,
                encodedFunction);

        EthCall response;
        try {
            response = web3j.ethCall(transaction, DefaultBlockParameterName.LATEST).sendAsync().get();
        } catch (Exception e) {
            throw new BlockchainException(BlockchainException.ErrorCode.NODE_ERROR,
                    "Failed to call canView on node: " + e.getMessage(), e);
        }

        if (response.hasError()) {
            throw new BlockchainException(BlockchainException.ErrorCode.NODE_ERROR,
                    "canView RPC error: " + response.getError().getMessage());
        }

        List<Type> result = FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());
        return !result.isEmpty() && (boolean) result.get(0).getValue();
    }

    public String getChainAnchoringHash() throws Exception {
        assertConfigured();

        EthBlock ethBlock = web3j.ethGetBlockByNumber(DefaultBlockParameterName.LATEST, false)
                .sendAsync()
                .get();

        if (ethBlock.hasError()) {
            throw new BlockchainException(BlockchainException.ErrorCode.NODE_ERROR,
                    "Error fetching latest block for anchoring: " + ethBlock.getError().getMessage());
        }

        return ethBlock.getBlock().getHash();
    }

    // ── Core: send tx ─────────────────────────────────────────────────────────

    private BlockchainReceiptDTO sendAndDecode(Function function) throws Exception {
        assertConfigured();

        String txHash = broadcastTransaction(function);
        log.info("Transaction broadcast: {}", txHash);

        return BlockchainReceiptDTO.builder()
                .txHash(txHash)
                .status("PENDING")
                .event(Collections.emptyMap()) // Event decoding removed
                .build();
    }

    private String broadcastTransaction(Function function) throws Exception {
        String encodedFunction = FunctionEncoder.encode(function);

        EthGetTransactionCount ethGetTransactionCount = web3j
                .ethGetTransactionCount(credentials.getAddress(), DefaultBlockParameterName.LATEST)
                .sendAsync().get();

        BigInteger nonce = ethGetTransactionCount.getTransactionCount();
        BigInteger gasLimit = BigInteger.valueOf(300_000);
        BigInteger gasPrice = web3j.ethGasPrice().sendAsync().get().getGasPrice();

        long chainId = appConfig.getBlockchain().getChainId() != null
                ? appConfig.getBlockchain().getChainId()
                : 1337L;

        RawTransaction rawTx = RawTransaction.createTransaction(
                nonce, gasPrice, gasLimit, contractAddress, encodedFunction);

        byte[] signedMessage = TransactionEncoder.signMessage(rawTx, chainId, credentials);
        String hexValue = Numeric.toHexString(signedMessage);

        EthSendTransaction response;
        try {
            response = web3j.ethSendRawTransaction(hexValue).sendAsync().get();
        } catch (Exception e) {
            throw new BlockchainException(BlockchainException.ErrorCode.NODE_ERROR,
                    "Failed to send transaction to node: " + e.getMessage(), e);
        }

        if (response.hasError()) {
            throw new BlockchainException(BlockchainException.ErrorCode.NODE_ERROR,
                    "RPC rejected transaction: " + response.getError().getMessage());
        }

        return response.getTransactionHash();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Bytes32 stringToBytes32(String string) {
        byte[] byteValue = string.getBytes(StandardCharsets.UTF_8);
        byte[] byteValue32 = new byte[32];
        System.arraycopy(byteValue, 0, byteValue32, 0, Math.min(byteValue.length, 32));
        return new Bytes32(byteValue32);
    }

    private void assertConfigured() {
        if (web3j == null || credentials == null) {
            throw new BlockchainException(BlockchainException.ErrorCode.CONFIG_ERROR,
                    "Blockchain is not configured. Check hospital.blockchain.* properties.");
        }
    }
}
