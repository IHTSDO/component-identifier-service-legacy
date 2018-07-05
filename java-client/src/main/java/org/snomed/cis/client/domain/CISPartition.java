package org.snomed.cis.client.domain;

public class CISPartition {

	private int namespace;
	private String partitionId;
	private int sequence;

	public CISPartition() {
	}

	public int getNamespace() {
		return namespace;
	}

	public void setNamespace(int namespace) {
		this.namespace = namespace;
	}

	public String getPartitionId() {
		return partitionId;
	}

	public void setPartitionId(String partitionId) {
		this.partitionId = partitionId;
	}

	public int getSequence() {
		return sequence;
	}

	public void setSequence(int sequence) {
		this.sequence = sequence;
	}

	@Override
	public String toString() {
		return "CISPartition{" +
				"namespace=" + namespace +
				", partitionId='" + partitionId + '\'' +
				", sequence=" + sequence +
				'}';
	}
}
