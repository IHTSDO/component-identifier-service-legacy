package org.snomed.cis.client.domain;

import java.util.Collection;
import java.util.stream.Collectors;

public final class CISBulkGetRequest implements CISBulkRequest {

	private Collection<Long> sctids;

	public CISBulkGetRequest(Collection<Long> sctids) {
		this.sctids = sctids;
	}

	public String getSctids() {
		return sctids.stream().map(Object::toString).collect(Collectors.joining(","));
	}

	@Override
	public int size() {
		return sctids.size();
	}
}
