CREATE DATABASE  IF NOT EXISTS `marinesystem` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `marinesystem`;
-- MySQL dump 10.13  Distrib 8.0.20, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: marinesystem
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.11-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `markers`
--

DROP TABLE IF EXISTS `markers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `markers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `lat` float(10,6) NOT NULL,
  `lng` float(10,6) NOT NULL,
  `depth` float DEFAULT 0,
  `heading` float NOT NULL,
  `created_at` datetime NOT NULL,
  `description` varchar(240) DEFAULT NULL,
  `metadata_url` varchar(240) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `markers`
--

LOCK TABLES `markers` WRITE;
/*!40000 ALTER TABLE `markers` DISABLE KEYS */;
INSERT INTO `markers` VALUES (1,'Mark1',43.177120,28.376711,0,0,'2020-05-12 12:00:01','description for mark1','/marine_system/metadata/out1.txt'),(2,'Mark2',43.048801,28.332760,0,0,'2020-05-12 12:00:02',NULL,'/marine_system/metadata/out2.txt'),(3,'Mark3',43.036758,28.492069,0,0,'2020-05-12 12:00:03',NULL,'/marine_system/metadata/out3.txt'),(4,'Mark4',43.112999,28.662350,0,0,'2020-05-12 12:00:04',NULL,'/marine_system/metadata/out4.txt'),(5,'Mark5',43.261189,28.821659,0,0,'2020-05-12 12:00:05',NULL,'/marine_system/metadata/out5.txt'),(6,'Mark6',43.263191,28.471470,0,0,'2020-05-12 12:00:06',NULL,NULL);
/*!40000 ALTER TABLE `markers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trackcolors`
--

DROP TABLE IF EXISTS `trackcolors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trackcolors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `color_hex` varchar(10) NOT NULL,
  `color_name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trackcolors`
--

LOCK TABLES `trackcolors` WRITE;
/*!40000 ALTER TABLE `trackcolors` DISABLE KEYS */;
INSERT INTO `trackcolors` VALUES (1,'#FF0000',NULL),(2,'#FFFF00',NULL),(3,'#FFFFFF',NULL),(4,'#00FFFF',NULL),(5,'#0000FF',NULL),(6,'#00FF00',NULL),(7,'#FF00FF',NULL);
/*!40000 ALTER TABLE `trackcolors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tracks`
--

DROP TABLE IF EXISTS `tracks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tracks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `track_type` int(11) NOT NULL,
  `enc_polyline` varchar(240) NOT NULL,
  `enc_levels` varchar(240) NOT NULL,
  `created_at` datetime NOT NULL,
  `description` varchar(240) DEFAULT NULL,
  `metadata_url` varchar(240) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_tracks_tracktypes_idx` (`track_type`),
  CONSTRAINT `FK_tracks_tracktypes` FOREIGN KEY (`track_type`) REFERENCES `tracktypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tracks`
--

LOCK TABLES `tracks` WRITE;
/*!40000 ALTER TABLE `tracks` DISABLE KEYS */;
INSERT INTO `tracks` VALUES (1,'Track1',1,'{itfGuqriDb[cPbBgn@sNen@pd@ia@ja@vXsNdn@bBvXtNflAkw@dn@','BBBBBBBBBB','2020-05-13 12:00:01','first test track',''),(2,'Track2',2,'s}ejGsjxnDzmc@~zKpiAiqs@mdZ~eBj~Es{ZdsXha@{lKirV','BBBBBBB','2020-05-13 12:00:02','second test track',''),(4,'Track_Planning_Expedition1',1,'oongGi~gkDbmEldE_qHg}WedHia@frF{~I','null','2020-06-23 11:43:06','First Black Sea Scan','null');
/*!40000 ALTER TABLE `tracks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tracktypes`
--

DROP TABLE IF EXISTS `tracktypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tracktypes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type_name` varchar(45) NOT NULL,
  `type_color` int(11) DEFAULT NULL,
  `type_description` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_tracktypes_trackcolors_idx` (`type_color`),
  CONSTRAINT `FK_tracktypes_trackcolors` FOREIGN KEY (`type_color`) REFERENCES `trackcolors` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tracktypes`
--

LOCK TABLES `tracktypes` WRITE;
/*!40000 ALTER TABLE `tracktypes` DISABLE KEYS */;
INSERT INTO `tracktypes` VALUES (1,'Planning',1,NULL),(2,'Ship/Bold',2,NULL),(3,'ROV',3,NULL),(4,'SSB (Surface Survey Bold)',4,NULL),(5,'MultiBeam',5,NULL),(6,'SideScan',6,NULL);
/*!40000 ALTER TABLE `tracktypes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

