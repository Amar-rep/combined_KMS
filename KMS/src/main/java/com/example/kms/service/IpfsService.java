package com.example.kms.service;

import com.example.kms.exception.IpfsConnectionException;
import com.example.kms.exception.IpfsFetchException;
import com.example.kms.exception.IpfsUploadException;
import io.ipfs.api.IPFS;
import io.ipfs.api.MerkleNode;
import io.ipfs.api.NamedStreamable;
import io.ipfs.multihash.Multihash;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class IpfsService {

    @Value("${ipfs.api.host:127.0.0.1}")
    private String ipfsApiHost;

    @Value("${ipfs.api.port:5001}")
    private int ipfsApiPort;

    private IPFS ipfs;


    private IPFS getIpfs() {
        if (ipfs == null) {
            try {
                String multiAddress = String.format("/ip4/%s/tcp/%d", ipfsApiHost, ipfsApiPort);
                ipfs = new IPFS(multiAddress);
            } catch (Exception e) {
                throw new IpfsConnectionException(
                        String.format("Failed to connect to IPFS at %s:%d - %s", ipfsApiHost, ipfsApiPort,
                                e.getMessage()),
                        e);
            }
        }
        return ipfs;
    }


    public String upload(byte[] data) {
        try {
            NamedStreamable.ByteArrayWrapper file = new NamedStreamable.ByteArrayWrapper(data);
            MerkleNode addResult = getIpfs().add(file).get(0);
            String cid = addResult.hash.toString();
            return cid;
        } catch (IpfsConnectionException e) {
            throw e; // Re-throw connection exceptions
        } catch (Exception e) {
            throw new IpfsUploadException("Error uploading data to IPFS: " + e.getMessage(), e);
        }
    }


    public byte[] fetch(String cid) {
        try {
            log.debug("Fetching CID from IPFS: {}", cid);
            Multihash filePointer = Multihash.fromBase58(cid);
            byte[] data = getIpfs().cat(filePointer);
            return data;
        } catch (IpfsConnectionException e) {
            throw e; // Re-throw connection exceptions
        } catch (Exception e) {
            throw new IpfsFetchException(cid, e);
        }
    }
}
