package org.snomed.cis.client;

public class CISClientException extends Exception {

	public CISClientException(String message) {
		super(message);
	}

	public CISClientException(String message, Throwable cause) {
		super(message, cause);
	}
}
