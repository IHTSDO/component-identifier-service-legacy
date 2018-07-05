package org.snomed.cis.client.domain;

public final class CISGenerateRequest implements CISBulkRequest {

	private final String softwareName;
	private int namespace;
	private String partitionId;
	private int quantity;

	public CISGenerateRequest(int namespace, String partitionId, int quantity, String softwareName) {
		this.namespace = namespace;
		this.partitionId = partitionId;
		this.quantity = quantity;
		this.softwareName = softwareName;
	}

	public int getNamespace() {
		return namespace;
	}

	public String getPartitionId() {
		return partitionId;
	}

	public int getQuantity() {
		return quantity;
	}

	public String getSoftware() {
		return softwareName;
	}

	@Override
	public int size() {
		return this.quantity;
	}

}
