-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: church_membership
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_audit_log`
--

DROP TABLE IF EXISTS `admin_audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_audit_log` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `description` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `admin_audit_log_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`admin_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_audit_log`
--

LOCK TABLES `admin_audit_log` WRITE;
/*!40000 ALTER TABLE `admin_audit_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_sessions`
--

DROP TABLE IF EXISTS `admin_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_sessions` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`),
  UNIQUE KEY `session_token` (`session_token`),
  KEY `idx_session_token` (`session_token`),
  KEY `idx_admin_id` (`admin_id`),
  CONSTRAINT `admin_sessions_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`admin_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_sessions`
--

LOCK TABLES `admin_sessions` WRITE;
/*!40000 ALTER TABLE `admin_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `role` enum('super_admin','admin','moderator') DEFAULT 'admin',
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES (1,'admin','admin@church.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','System Administrator','super_admin',1,NULL,'2025-10-13 13:04:15','2025-10-13 13:04:15');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_reports`
--

DROP TABLE IF EXISTS `ai_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `report_type` varchar(50) NOT NULL,
  `period` varchar(20) NOT NULL,
  `content` text NOT NULL,
  `generated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_reports`
--

LOCK TABLES `ai_reports` WRITE;
/*!40000 ALTER TABLE `ai_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `type` varchar(50) DEFAULT 'general',
  `is_urgent` tinyint(1) DEFAULT '0',
  `created_by` varchar(100) DEFAULT 'Admin',
  `target_demographic` varchar(50) DEFAULT 'all',
  `expiry_date` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_announcements_expiry` (`expiry_date`),
  KEY `idx_announcements_type` (`type`),
  KEY `idx_announcements_demographic` (`target_demographic`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` VALUES (1,'Welcome Service this Sunday!','Join us this Sunday at 10:00 AM for our weekly welcome service. There will be a special guest speaker and fellowship with coffee and donuts afterward.',NULL,'general',0,'Admin','all','2025-08-09 00:00:00','2025-08-08 13:40:27','2025-08-08 13:54:35'),(2,'Annual Church Picnic','Our annual picnic is scheduled for next Saturday at the community park. Please sign up in the foyer to bring a dish to share. All are welcome!',NULL,'general',0,'Admin','all','2025-09-15 23:59:59','2025-08-08 13:40:27','2025-08-08 13:40:27'),(3,'Leaders Meeting','be informed that on sunday there will be a leaders meeting and all leaders are expected to be present',NULL,'general',0,'Admin','all','2025-10-25 00:00:00','2025-10-10 09:31:18','2025-10-10 09:31:18');
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `current_leadership_view`
--

DROP TABLE IF EXISTS `current_leadership_view`;
/*!50001 DROP VIEW IF EXISTS `current_leadership_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `current_leadership_view` AS SELECT 
 1 AS `role_id`,
 1 AS `role_name`,
 1 AS `description`,
 1 AS `max_allowed`,
 1 AS `min_age`,
 1 AS `max_age`,
 1 AS `gender_requirement`,
 1 AS `assignment_id`,
 1 AS `member_id`,
 1 AS `assigned_at`,
 1 AS `first_name`,
 1 AS `last_name`,
 1 AS `gender`,
 1 AS `dob`,
 1 AS `age`,
 1 AS `phone_number`,
 1 AS `address`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `dept_id` int NOT NULL AUTO_INCREMENT,
  `dept_name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`dept_id`),
  UNIQUE KEY `dept_name` (`dept_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_rsvp`
--

DROP TABLE IF EXISTS `event_rsvp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_rsvp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `member_id` int NOT NULL,
  `status` enum('attending','not_attending','maybe') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_attending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_event_member` (`event_id`,`member_id`),
  KEY `idx_event_id` (`event_id`),
  KEY `idx_member_id` (`member_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_updated_at` (`updated_at`),
  CONSTRAINT `fk_event_rsvp_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_event_rsvp_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`mid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_rsvp`
--

LOCK TABLES `event_rsvp` WRITE;
/*!40000 ALTER TABLE `event_rsvp` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_rsvp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `event_date` date NOT NULL,
  `event_time` time NOT NULL,
  `location` varchar(255) NOT NULL,
  `target_demographic` enum('all','youth','men','women','children','leadership') DEFAULT 'all',
  `created_by` int DEFAULT NULL,
  `max_attendees` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `members` (`mid`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'Youth Conference 2025','Annual youth conference with inspiring speakers and workshops','2025-09-15','09:00:00','Main Sanctuary','youth',NULL,NULL,1,'2025-08-22 11:37:50','2025-08-22 11:37:50'),(2,'Men\'s Fellowship Breakfast','Monthly men\'s fellowship breakfast and discussion','2025-08-30','08:00:00','Fellowship Hall','men',NULL,NULL,1,'2025-08-22 11:37:50','2025-08-22 11:37:50'),(3,'Women\'s Bible Study','Weekly women\'s Bible study group','2025-08-25','19:00:00','Conference Room','women',NULL,NULL,1,'2025-08-22 11:37:50','2025-08-22 11:37:50'),(4,'Church Family Picnic','Annual church family picnic for all ages','2025-09-07','12:00:00','Church Grounds','all',NULL,NULL,1,'2025-08-22 11:37:50','2025-08-22 11:37:50');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leadership_assignments`
--

DROP TABLE IF EXISTS `leadership_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leadership_assignments` (
  `assignment_id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `member_id` int NOT NULL,
  `assigned_at` date NOT NULL,
  `term_start` date NOT NULL,
  `term_end` date DEFAULT NULL,
  `status` enum('active','ended','pending') DEFAULT 'active',
  PRIMARY KEY (`assignment_id`),
  KEY `role_id` (`role_id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `leadership_assignments_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `leadership_roles` (`role_id`) ON DELETE CASCADE,
  CONSTRAINT `leadership_assignments_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `members` (`mid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leadership_assignments`
--

LOCK TABLES `leadership_assignments` WRITE;
/*!40000 ALTER TABLE `leadership_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `leadership_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leadership_roles`
--

DROP TABLE IF EXISTS `leadership_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leadership_roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `dept_id` int DEFAULT NULL,
  `role_name` varchar(100) NOT NULL,
  `description` text,
  `max_allowed` int DEFAULT NULL,
  `min_age` int DEFAULT NULL,
  `max_age` int DEFAULT NULL,
  `gender_requirement` enum('male','female','any') DEFAULT 'any',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `term_start` date DEFAULT NULL,
  `term_end` date DEFAULT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`),
  KEY `dept_id` (`dept_id`),
  CONSTRAINT `leadership_roles_ibfk_1` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leadership_roles`
--

LOCK TABLES `leadership_roles` WRITE;
/*!40000 ALTER TABLE `leadership_roles` DISABLE KEYS */;
INSERT INTO `leadership_roles` VALUES (1,NULL,'Pastor','Senior pastoral leadership of the church',1,NULL,NULL,'any','2025-08-17 22:31:24','2025-08-17 22:31:24',NULL,NULL),(2,NULL,'Elder','Spiritual oversight and guidance',NULL,35,NULL,'any','2025-08-17 22:31:24','2025-08-17 22:31:24',NULL,NULL),(3,NULL,'Youth Leader','Leadership for youth ministry programs',2,16,35,'any','2025-08-17 22:31:24','2025-08-17 22:31:24',NULL,NULL),(4,NULL,'Men\'s Leader','Leadership for men\'s ministry and programs',2,35,NULL,'male','2025-08-17 22:31:24','2025-08-17 22:31:24',NULL,NULL),(5,NULL,'Women\'s Leader','Leadership for women\'s ministry and programs',2,35,NULL,'female','2025-08-17 22:31:24','2025-08-17 22:31:24',NULL,NULL),(6,NULL,'Children\'s Leader','Leadership for children\'s ministry',2,18,NULL,'any','2025-08-17 22:31:24','2025-08-17 22:31:24',NULL,NULL),(7,NULL,'Deacon','Service and administrative support',NULL,21,NULL,'any','2025-08-17 22:31:24','2025-08-17 22:31:24',NULL,NULL);
/*!40000 ALTER TABLE `leadership_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member_leadership`
--

DROP TABLE IF EXISTS `member_leadership`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `member_leadership` (
  `id` int NOT NULL AUTO_INCREMENT,
  `member_id` int NOT NULL,
  `role_id` int NOT NULL,
  `assigned_by` int DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_member_role` (`member_id`,`role_id`),
  KEY `idx_member_leadership_member_id` (`member_id`),
  KEY `idx_member_leadership_role_id` (`role_id`),
  KEY `idx_member_leadership_assigned_at` (`assigned_at`),
  CONSTRAINT `member_leadership_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`mid`) ON DELETE CASCADE,
  CONSTRAINT `member_leadership_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `leadership_roles` (`role_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member_leadership`
--

LOCK TABLES `member_leadership` WRITE;
/*!40000 ALTER TABLE `member_leadership` DISABLE KEYS */;
INSERT INTO `member_leadership` VALUES (4,31,1,NULL,'2025-08-22 12:59:30'),(5,49,2,NULL,'2025-08-27 14:51:31'),(6,41,2,NULL,'2025-08-27 14:51:45'),(7,36,3,NULL,'2025-08-27 14:51:55'),(8,54,3,NULL,'2025-08-27 14:51:58');
/*!40000 ALTER TABLE `member_leadership` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `mid` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(30) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `gender` varchar(1) NOT NULL,
  `dob` date NOT NULL,
  `address` varchar(100) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `profile_completed` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`mid`)
) ENGINE=InnoDB AUTO_INCREMENT=358 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
INSERT INTO `members` VALUES (29,'Nathan','Phiri','M','2003-07-16','Chawama 187/09','0975599136',1,'2025-07-01 21:25:17','2025-07-17 11:45:32'),(30,'Beauty ','Banda','F','2008-06-10','Chawama 156/05','0972514103',1,'2025-07-01 21:27:56','2025-07-29 16:06:39'),(31,'Alick ','Mbambo','M','1982-09-16','Chawama 156/05','0977570034',1,'2025-07-01 21:31:10','2025-07-17 11:45:32'),(32,'Dave','Mbambo','M','2006-07-04','Chawama 156/07','0977570035',1,'2025-07-10 11:58:55','2025-07-17 11:45:32'),(33,'Ocean ','Mbiza','M','1994-07-30','Unza','0975860320',1,'2025-07-10 12:22:36','2025-07-17 11:45:32'),(34,'Lupandu ','Masumba','M','1999-07-22','Unza','0972255136',1,'2025-07-14 15:30:13','2025-07-22 14:09:12'),(35,'Paul','Mbambo','M','2003-08-13','chawama clinic\n','0979630845',1,'2025-07-17 19:16:49','2025-07-24 13:14:47'),(36,'Dave','Banda','M','1998-07-16','Unza','0970000000',1,'2025-07-18 13:34:29','2025-07-18 13:34:29'),(37,'george ','mwansa','M','2010-07-22','woodlands','',1,'2025-08-27 14:41:08','2025-08-27 14:41:08'),(38,'John','Phiri','M','1980-03-15','Plot 123, Kamwala South, Lusaka','+260977111222',1,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(39,'Mary','Phiri','F','1984-07-09','Plot 123, Kamwala South, Lusaka','+260965333444',1,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(40,'Grace','Phiri','F','2012-05-20','Plot 123, Kamwala South, Lusaka',NULL,0,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(41,'Benson','Zimba','M','1975-01-22','House 56, Matero East, Lusaka','+260971222333',1,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(42,'Chanda','Zimba','M','2008-09-14','House 56, Matero East, Lusaka',NULL,0,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(43,'Peter','Mwansa','M','1992-06-05','Flat 9, Kabulonga, Lusaka','+260977654321',1,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(44,'Esther','Mwansa','F','1995-12-18','Flat 9, Kabulonga, Lusaka','+260976111555',1,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(45,'Luyando','Mwansa','F','2016-03-02','Flat 9, Kabulonga, Lusaka',NULL,0,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(46,'Brian','Mbewe','M','1988-11-23','House 10, Chalala, Lusaka','+260965222111',1,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(47,'Natasha','Mbewe','F','1990-07-30','House 10, Chalala, Lusaka','+260977333666',1,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(48,'Joseph','Mulenga','M','1979-04-11','Plot 78, Kanyama, Lusaka','+260974555888',1,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(49,'Agness','Mulenga','F','1982-09-25','Plot 78, Kanyama, Lusaka','+260979444777',1,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(50,'Thabo','Mulenga','M','2011-01-09','Plot 78, Kanyama, Lusaka',NULL,0,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(51,'Henry','Ngoma','M','1965-05-14','House 45, Woodlands, Lusaka','+260972888111',1,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(52,'Martha','Ngoma','F','1970-10-02','House 45, Woodlands, Lusaka','+260978333222',1,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(53,'Kelvin','Lungu','M','1999-08-20','Off Burma Road, Kabwata, Lusaka','+260975111333',1,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(54,'Bridget','Lungu','F','2002-12-10','Off Burma Road, Kabwata, Lusaka','+260976222444',0,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(55,'Patrick','Chileshe','M','1987-07-16','Plot 34, Emmasdale, Lusaka','+260974999000',1,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(56,'Naomi','Chileshe','F','1991-02-27','Plot 34, Emmasdale, Lusaka','+260971123456',1,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(57,'Mwape','Chileshe','M','2014-10-05','Plot 34, Emmasdale, Lusaka',NULL,0,'2025-08-27 14:49:17','2025-08-27 14:49:17'),(59,'Brian','Mbewe','M','2003-02-17','House 200, Kanyama, Lusaka','+260960288848',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(61,'Esther','Phiri','F','1996-12-17','House 129, Kamwala South, Lusaka','+260962871706',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(65,'Thandiwe','Ngoma','F','1965-08-16','House 195, Kaunda Square, Lusaka','+260986953490',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(66,'Esther','Zimba','F','1966-11-14','House 16, Chalala, Lusaka','+260973851235',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(67,'Mary','Lungu','F','1964-11-18','House 175, Chilenje, Lusaka','+260964416111',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(68,'Naomi','Zimba','F','1978-01-22','House 198, Kaunda Square, Lusaka','+260982780925',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(70,'Natasha','Mbewe','F','1968-04-27','House 155, Ibex Hill, Lusaka','+260959717556',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(71,'Peter','Zimba','M','1968-12-09','House 148, Kabulonga, Lusaka','+260996193279',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(72,'Henry','Phiri','M','2005-01-01','House 22, Kanyama, Lusaka','+260986838491',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(73,'Henry','Phiri','M','1998-10-14','House 74, Chalala, Lusaka','+260953291908',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(74,'Grace','Ngoma','F','1991-01-10','House 2, Roma, Lusaka','+260997778139',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(76,'Henry','Phiri','M','2012-10-24','House 113, Chilenje, Lusaka','',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(77,'Agness','Ngoma','F','1996-08-04','House 97, Chilenje, Lusaka','+260983908590',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(78,'Chanda','Mulenga','M','1986-10-28','House 193, Kanyama, Lusaka','+260998443584',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(79,'Chanda','Ngoma','M','1989-10-07','House 78, Roma, Lusaka','+260975228279',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(80,'Grace','Lungu','F','2016-12-17','House 93, Rhodes Park, Lusaka','',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(81,'Thandiwe','Phiri','F','2010-04-04','House 147, Emmasdale, Lusaka','+260973629169',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(82,'Kelvin','Mbewe','M','1989-01-27','House 163, Matero, Lusaka','+260968944961',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(83,'Luyando','Zimba','F','2018-10-04','House 9, Chilenje, Lusaka','',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(84,'Benson','Lungu','M','1973-02-02','House 107, Chilenje, Lusaka','+260970885809',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(85,'Esther','Mbewe','F','1988-05-23','House 88, Northmead, Lusaka','+260993858138',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(86,'Henry','Zimba','M','1965-04-24','House 141, Chelston, Lusaka','+260978260975',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(87,'Brian','Mulenga','M','2003-03-15','House 139, Lilayi, Lusaka','+260962433264',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(88,'Henry','Mbewe','M','1961-08-07','House 135, Kanyama, Lusaka','+260978219290',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(89,'Joseph','Chileshe','M','2013-07-26','House 167, Kabwata, Lusaka','',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(90,'Luyando','Phiri','F','1960-01-22','House 167, Kabwata, Lusaka','+260983195229',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(91,'Thabo','Mwansa','M','2011-11-25','House 167, Kabulonga, Lusaka','+260956896021',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(92,'Bridget','Lungu','F','2008-12-05','House 174, Chalala, Lusaka','+260996918675',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(93,'Chanda','Mbewe','M','1969-07-12','House 106, Avondale, Lusaka','+260953156881',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(94,'Kelvin','Zimba','M','1984-06-16','House 120, Chalala, Lusaka','+260972593930',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(95,'Martha','Lungu','F','1966-01-03','House 188, Kabwata, Lusaka','+260997112762',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(96,'Joseph','Lungu','M','1965-09-27','House 198, Kanyama, Lusaka','+260973539242',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(97,'Luyando','Zimba','F','1968-11-01','House 168, Rhodes Park, Lusaka','+260999725889',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(98,'Mwape','Chileshe','M','1981-09-17','House 16, Northmead, Lusaka','+260968321207',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(99,'Mary','Chileshe','F','1971-11-15','House 194, Kaunda Square, Lusaka','+260950975983',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(100,'Martha','Mwansa','F','1985-03-27','House 5, Kamwala South, Lusaka','+260951266269',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(101,'Kelvin','Zimba','M','1970-11-05','House 43, Mtendere, Lusaka','+260998115015',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(102,'Brian','Mbewe','M','1997-08-06','House 78, Kabwata, Lusaka','+260953200719',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(103,'Esther','Zimba','F','1964-09-10','House 185, Chilenje, Lusaka','+260968228124',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(104,'Chanda','Zimba','M','1992-08-11','House 170, Roma, Lusaka','+260965433455',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(105,'Martha','Lungu','F','1974-03-15','House 6, Emmasdale, Lusaka','+260972228537',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(106,'Peter','Lungu','M','1998-08-05','House 171, Garden Compound, Lusaka','+260986565120',0,'2025-08-28 08:53:01','2025-08-28 08:53:01'),(107,'Martha','Zimba','F','1986-12-03','House 131, Northmead, Lusaka','+260980427524',0,'2025-08-28 08:53:01','2025-08-28 08:53:01');
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mobileusers`
--

DROP TABLE IF EXISTS `mobileusers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mobileusers` (
  `mobile_id` int NOT NULL AUTO_INCREMENT,
  `mid` int DEFAULT NULL,
  `phone_number` varchar(10) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `push_token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`mobile_id`),
  UNIQUE KEY `phone_number` (`phone_number`),
  KEY `mid` (`mid`),
  KEY `idx_mobile_users_push_token` (`push_token`),
  CONSTRAINT `mobileusers_ibfk_1` FOREIGN KEY (`mid`) REFERENCES `members` (`mid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mobileusers`
--

LOCK TABLES `mobileusers` WRITE;
/*!40000 ALTER TABLE `mobileusers` DISABLE KEYS */;
INSERT INTO `mobileusers` VALUES (6,29,'0975599136','$2y$10$0qKb4eRd6tWEmhbDX2jUEeLqnwTeFnzebam/WTDDd6DYQtNtccWP.',1,'2025-06-30 13:13:38','2025-07-01 21:25:17',NULL),(7,30,'0972514103','$2y$10$OaNJyszUZMA75wBljfw/U.nGSx2eCb8Fg09PWnnDeXVexLso0U87.',1,'2025-07-01 21:26:11','2025-07-01 21:27:56',NULL),(8,31,'0977570034','$2y$10$QTQremgibnNGSC.rLeix3OUnBl2teoXFsr36Xq6YZkyTWqeINxLIW',1,'2025-07-01 21:29:37','2025-07-01 21:31:10',NULL),(9,32,'0977570035','$2y$10$e4tjiL8AluJtCZXst/jLHuHno9rvEzof12tpPgGKHlBwI3z71kFx2',1,'2025-07-10 11:57:04','2025-07-10 11:58:55',NULL),(10,33,'0975860320','$2y$10$XlkbP6zmV.ag6M8uD8drB.bUTV/y49Awx84kAoVjbcSXVswkpmopu',1,'2025-07-10 12:16:30','2025-07-10 12:22:36',NULL),(11,34,'0972255136','$2y$10$wffDMI4U79W1wmG2jC4heOmoPEIKC/wn3/.SVcPJqRbZJe0NN5c/C',1,'2025-07-14 15:28:47','2025-07-14 15:30:13',NULL),(12,36,'0970000000','$2y$10$.tKOqt2MIrE/3tHfkbcieOACxi95P3a5TiMbFwzkd4U6GbR9gvruW',1,'2025-07-18 13:04:25','2025-07-18 13:34:31',NULL),(13,35,'0979630845','$2y$10$RA0Opch1w4GefaGTAQ51S.pDAOBTU7PLdIzKJyrPkLb/jzJHlfxkW',1,'2025-07-31 15:33:19','2025-07-31 15:36:03',NULL);
/*!40000 ALTER TABLE `mobileusers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp`
--

DROP TABLE IF EXISTS `otp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone_number` varchar(15) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NOT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `attempts` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_phone_otp` (`phone_number`,`otp_code`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp`
--

LOCK TABLES `otp` WRITE;
/*!40000 ALTER TABLE `otp` DISABLE KEYS */;
INSERT INTO `otp` VALUES (7,'0975599136','487594','2025-06-30 13:13:38','2025-06-30 11:18:38',1,0),(8,'0972514103','629828','2025-07-01 21:26:11','2025-07-01 19:31:11',1,0),(9,'0977570034','204337','2025-07-01 21:29:37','2025-07-01 19:34:37',1,0),(10,'0977570035','647997','2025-07-10 11:57:05','2025-07-10 10:02:05',1,0),(11,'0975860320','501150','2025-07-10 12:16:31','2025-07-10 10:21:31',1,0),(12,'0972255136','299110','2025-07-14 15:28:47','2025-07-14 13:33:47',1,0),(13,'0970000000','752955','2025-07-18 13:04:25','2025-07-18 11:09:25',1,0),(14,'0979630845','279762','2025-07-31 15:35:39','2025-07-31 13:40:39',1,0);
/*!40000 ALTER TABLE `otp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pushnotificationlog`
--

DROP TABLE IF EXISTS `pushnotificationlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pushnotificationlog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone_number` varchar(20) NOT NULL,
  `push_token` varchar(255) DEFAULT NULL,
  `notification_type` varchar(50) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `body` text,
  `data` json DEFAULT NULL,
  `status` enum('sent','delivered','failed') DEFAULT 'sent',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_phone_number` (`phone_number`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pushnotificationlog`
--

LOCK TABLES `pushnotificationlog` WRITE;
/*!40000 ALTER TABLE `pushnotificationlog` DISABLE KEYS */;
/*!40000 ALTER TABLE `pushnotificationlog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usersessions`
--

DROP TABLE IF EXISTS `usersessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usersessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mid` int NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `mid` (`mid`),
  KEY `idx_session_token` (`session_token`),
  KEY `idx_expires` (`expires_at`),
  CONSTRAINT `usersessions_ibfk_1` FOREIGN KEY (`mid`) REFERENCES `members` (`mid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usersessions`
--

LOCK TABLES `usersessions` WRITE;
/*!40000 ALTER TABLE `usersessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `usersessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `current_leadership_view`
--

/*!50001 DROP VIEW IF EXISTS `current_leadership_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `current_leadership_view` AS select `lr`.`role_id` AS `role_id`,`lr`.`role_name` AS `role_name`,`lr`.`description` AS `description`,`lr`.`max_allowed` AS `max_allowed`,`lr`.`min_age` AS `min_age`,`lr`.`max_age` AS `max_age`,`lr`.`gender_requirement` AS `gender_requirement`,`ml`.`id` AS `assignment_id`,`ml`.`member_id` AS `member_id`,`ml`.`assigned_at` AS `assigned_at`,`m`.`first_name` AS `first_name`,`m`.`last_name` AS `last_name`,`m`.`gender` AS `gender`,`m`.`dob` AS `dob`,timestampdiff(YEAR,`m`.`dob`,curdate()) AS `age`,`m`.`phone_number` AS `phone_number`,`m`.`address` AS `address` from ((`leadership_roles` `lr` left join `member_leadership` `ml` on((`lr`.`role_id` = `ml`.`role_id`))) left join `members` `m` on((`ml`.`member_id` = `m`.`mid`))) order by `lr`.`role_id`,`ml`.`assigned_at` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-13 16:53:03
