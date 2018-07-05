package org.snomed.cis.maintenance;

import org.snomed.cis.client.CISClient;
import org.snomed.cis.client.domain.CISNamespace;
import org.snomed.cis.client.domain.CISPartition;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@SpringBootApplication
public class MaintenanceApplication implements ApplicationRunner {

	private static final int TIMEOUT_SECONDS = 60;
	private static final String SOFTWARE_NAME = "CommandLineMaintenanceApp";

	public static void main(String[] args) {
		SpringApplication.run(MaintenanceApplication.class, args);
	}

	@Override
	public void run(ApplicationArguments args) throws Exception {
		System.out.println("\nThis process will synchronise the sequence of every partition within every namespace\n" +
				"from the source CIS instance to the target CIS instance\n" +
				"where the partition is available on both sides.\n");

		if (!args.containsOption("synchronise")) {
			System.err.println("\nPlease specify the --synchronise argument. There are no other operations available on the command line at this point.\n");
			System.exit(1);
		}

		String sourceUrl = getRequiredArg("sourceUrl", args);
		String sourceUsername = getRequiredArg("sourceUsername", args);
		String sourcePassword = getRequiredArg("sourcePassword", args);

		String targetUrl = getRequiredArg("targetUrl", args);
		String targetUsername = getRequiredArg("targetUsername", args);
		String targetPassword = getRequiredArg("targetPassword", args);

		System.out.println("Attempting connection to " + sourceUrl);
		CISClient sourceClient = new CISClient(sourceUrl, sourceUsername, sourcePassword, SOFTWARE_NAME, TIMEOUT_SECONDS);

		System.out.println("Attempting connection to " + targetUrl);
		CISClient targetClient = new CISClient(targetUrl, targetUsername, targetPassword, SOFTWARE_NAME, TIMEOUT_SECONDS);

		List<CISNamespace> sourceNamespaces = sourceClient.getNamespaces();
		List<CISNamespace> targetNamespaces = targetClient.getNamespaces();

		Map<String, CISNamespace> sourceNamespaceMap = sourceNamespaces.stream().collect(Collectors.toMap(CISNamespace::getNamespace, Function.identity()));
		Map<String, CISNamespace> targetNamespaceMap = targetNamespaces.stream().collect(Collectors.toMap(CISNamespace::getNamespace, Function.identity()));

		for (String sourceNamespace : sourceNamespaceMap.keySet()) {
			CISNamespace targetNamespace = targetNamespaceMap.get(sourceNamespace);
			List<CISPartition> sourcePartitions = sourceNamespaceMap.get(sourceNamespace).getPartitions();
			if (sourcePartitions != null) {
				if (targetNamespace != null) {
					List<CISPartition> targetPartitions = targetNamespace.getPartitions();
					if (targetPartitions != null) {
						Map<String, CISPartition> targetPartitionMap = targetPartitions.stream().collect(Collectors.toMap(CISPartition::getPartitionId, Function.identity()));
						for (CISPartition sourcePartition : sourcePartitions) {
							CISPartition targetPartition = targetPartitionMap.get(sourcePartition.getPartitionId());
							if (targetPartition != null) {
								System.out.println("Source Partition:" + sourcePartition.toString());
								System.out.println("Target Partition:" + targetPartition.toString());
								int targetBehindCount = sourcePartition.getSequence() - targetPartition.getSequence();
								if (targetBehindCount > 0) {
									System.out.println(String.format("The sequence of target partition %s for namespace %s is %s behind source. Bumping target sequence...", sourcePartition.getPartitionId(), sourceNamespace, targetBehindCount));
									targetClient.reserve(targetPartition.getNamespace(), targetPartition.getPartitionId(), targetBehindCount);
								}
							} else {
								System.out.println(String.format("Source partition %s for namespace %s does not exist in target CIS, skipping.", sourcePartition.getPartitionId(), sourceNamespace));
							}
						}
					} else {
						System.out.println(String.format("Partitions for namespace %s exist in source but none exist in target CIS, skipping.", sourceNamespace));
					}
				} else {
					System.out.println(String.format("Source namespace %s does not exist in target CIS, skipping.", sourceNamespace));
				}
			}
		}
		System.out.println("Identifier sequence synchronisation complete.\n");
		System.exit(0);
	}

	private String getRequiredArg(String argName, ApplicationArguments args) {
		List<String> values = args.getOptionValues(argName);
		if (values == null || values.isEmpty()) {
			argumentError(argName, "Argument %s is required!");
		} else if (values.size() > 1) {
			argumentError(argName, "Argument %s should only have a single value!");
		}
		return values.get(0);
	}

	private void argumentError(String argName, String format) {
		System.err.println(String.format(format, argName));
		System.err.println("\nExiting...\n");
		System.exit(1);
	}

}
