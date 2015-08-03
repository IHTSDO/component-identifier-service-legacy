CREATE DATABASE  IF NOT EXISTS `idservice` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `idservice`;
-- MySQL dump 10.13  Distrib 5.6.13, for osx10.6 (i386)
--
-- Host: 127.0.0.1    Database: idservice
-- ------------------------------------------------------
-- Server version	5.1.52

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bulkJob`
--

DROP TABLE IF EXISTS `bulkJob`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bulkJob` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `request` blob,
  `created_at` datetime DEFAULT NULL,
  `modified_at` datetime DEFAULT NULL,
  `log` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=43 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `namespace`
--

DROP TABLE IF EXISTS `namespace`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `namespace` (
  `namespace` int(11) NOT NULL DEFAULT '0',
  `organizationName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`namespace`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `partitions`
--

DROP TABLE IF EXISTS `partitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `partitions` (
  `namespace` int(11) NOT NULL DEFAULT '0',
  `partitionId` varchar(255) NOT NULL DEFAULT '',
  `sequence` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`namespace`,`partitionId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permissionsNamespace`
--

DROP TABLE IF EXISTS `permissionsNamespace`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissionsNamespace` (
  `namespace` int(11) NOT NULL DEFAULT '0',
  `username` varchar(255) NOT NULL DEFAULT '',
  `role` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`namespace`,`username`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permissionsScheme`
--

DROP TABLE IF EXISTS `permissionsScheme`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissionsScheme` (
  `scheme` varchar(255) NOT NULL DEFAULT '',
  `username` varchar(255) NOT NULL DEFAULT '',
  `role` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`scheme`,`username`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `schemeId`
--

DROP TABLE IF EXISTS `schemeId`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schemeId` (
  `scheme` varchar(18) NOT NULL DEFAULT '',
  `schemeId` varchar(18) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '',
  `sequence` float DEFAULT NULL,
  `checkDigit` int(11) DEFAULT NULL,
  `systemId` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `software` varchar(255) DEFAULT NULL,
  `expirationDate` date DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `jobId` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `modified_at` datetime DEFAULT NULL,
  PRIMARY KEY (`scheme`,`schemeId`),
  KEY `jobid` (`jobId`),
  KEY `sysId` (`systemId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `schemeIdBase`
--

DROP TABLE IF EXISTS `schemeIdBase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schemeIdBase` (
  `scheme` varchar(18) NOT NULL DEFAULT '',
  `idBase` varchar(18) DEFAULT NULL,
  PRIMARY KEY (`scheme`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sctId`
--

DROP TABLE IF EXISTS `sctId`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sctId` (
  `sctid` varchar(18) NOT NULL DEFAULT '',
  `sequence` bigint(20) DEFAULT NULL,
  `namespace` int(11) DEFAULT NULL,
  `partitionId` varchar(255) DEFAULT NULL,
  `checkDigit` tinyint(4) DEFAULT NULL,
  `systemId` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `software` varchar(255) DEFAULT NULL,
  `expirationDate` date DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `jobId` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `modified_at` datetime DEFAULT NULL,
  PRIMARY KEY (`sctid`),
  KEY `sysid` (`systemId`),
  KEY `jobid` (`jobId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'idservice'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-08-03 18:29:03
