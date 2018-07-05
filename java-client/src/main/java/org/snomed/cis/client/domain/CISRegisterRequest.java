package org.snomed.cis.client.domain;

import java.util.Collection;
import java.util.UUID;
import java.util.stream.Collectors;

public final class CISRegisterRequest implements CISBulkRequest {

	private final String softwareName;
	private int namespace;
	private Collection<RegisterId> records;

	public CISRegisterRequest(int namespace, Collection<Long> sctIds, String softwareName) {
		this.namespace = namespace;
		records = sctIds.stream().map(RegisterId::new).collect(Collectors.toList());
		this.softwareName = softwareName;
	}

	public int getNamespace() {
		return namespace;
	}

	public String getSoftware() {
		return softwareName;
	}
	
	public Collection<RegisterId> getRecords() {
		return records;
	}

	@Override
	public int size() {
		return records.size();
	}

	public static final class RegisterId {
		private String sctid;
		private String systemId;

		public RegisterId(Long sctid) {
			this.sctid = sctid.toString();
			systemId = UUID.randomUUID().toString();
		}

		public String getSctid() {
			return sctid;
		}

		public String getSystemId() {
			return systemId;
		}
	}
}
