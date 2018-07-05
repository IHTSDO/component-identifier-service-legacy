package org.snomed.cis.client.domain;

import java.util.List;

public class CISNamespace {

	private String namespace;
	private String organizationName;
	private List<CISPartition> partitions;

	public CISNamespace() {
	}

	public String getNamespace() {
		return namespace;
	}

	public void setNamespace(String namespace) {
		this.namespace = namespace;
	}

	public String getOrganizationName() {
		return organizationName;
	}

	public void setOrganizationName(String organizationName) {
		this.organizationName = organizationName;
	}

	public List<CISPartition> getPartitions() {
		return partitions;
	}

	public void setPartitions(List<CISPartition> partitions) {
		this.partitions = partitions;
	}

	@Override
	public String toString() {
		return "CISNamespace{" +
				"namespace='" + namespace + '\'' +
				", organizationName='" + organizationName + '\'' +
				", partitions=" + partitions +
				'}';
	}
}
