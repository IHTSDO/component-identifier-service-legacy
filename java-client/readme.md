# CIS Java Client

This client can be used as a library or on the command line.

## Command Line Use
### Sequence Synchronisation
This client can be used on the command line to synchronise the sequence numbers of all namespaces and partitions between two instances of CIS via the REST API.

The namespaces, partitions and sequences will be read from both the source and target CIS instances. 

Where a partition exists on both the source and target CIS instance and the target partition sequence is less than the source partition sequence 
then a bulk reservation of identifiers will be performed to increase the target sequence to match the source.

`java -jar cis-client*exec.jar --synchronise --sourceUrl=https://prod-cis/api/ --sourceUsername=uat-cis-user --sourcePassword=SOME_PASSWORD --targetUrl=https://uat-cis/api/ --targetUsername=dev-cis-user --targetPassword=SOME_PASSWORD`
