CREATE DATABASE  IF NOT EXISTS `thechatmatrix` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */;
USE `thechatmatrix`;
-- MySQL dump 10.13  Distrib 8.0.13, for Win64 (x86_64)
--
-- Host: localhost    Database: thechatmatrix
-- ------------------------------------------------------
-- Server version	8.0.13

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `payment` (
  `charge_id` varchar(128) NOT NULL,
  `stripe_account` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES ('ch_1Eg7wHLgZ2po8YVgfj5w1m9G','acct_1EfhZhLgZ2po8YVg'),('ch_1Eg7ztLgZ2po8YVgvCtHiWz4','acct_1EfhZhLgZ2po8YVg');
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `permission` (
  `session_id` varchar(128) NOT NULL,
  `expires` datetime NOT NULL,
  `data` varchar(256) NOT NULL,
  UNIQUE KEY `session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
INSERT INTO `permission` VALUES ('::1','2019-06-17 13:45:58','terms_of_use_and_privacy_policy'),('::ffff:192.168.43.1','2019-06-17 14:34:38','terms_of_use_and_privacy_policy'),('::ffff:192.168.43.241','2019-06-17 13:45:32','terms_of_use_and_privacy_policy'),('eLfvcm6b84TbTZLvCpRS','2019-06-17 13:45:54','terms_of_use_and_privacy_policy');
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('18DDSHR017sQMY68o_03-ZHHHdPBWCkb',1560850172,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('1Gy8xJgkyk38XktZCNc29ud7gOWMfx9z',1560850460,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('4cxkS3yqkJY46LUDewCp07CGrWJvOrBz',1560846101,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('855boab9mp5pFEeRw20uMKjSjzcJLWP5',1560850169,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('8guDQuL-fYBSfn9Yz3BGYpeAuWRYwyJ9',1560850505,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('99ZnIooS_RiazS43l4_5T8fkDKbq5qY7',1560841822,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('A4_6EUgkOzwavJ9hd62IDJ_qKaarbtsS',1560849980,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('A6H-1i4vVnqZkIakt9TvgfVjNQ961Pby',1560855126,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('Aks2_j0Cq9g5NTaWqoAJ6cl8g1O-FCaw',1560850143,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('B80LL1cKCxPzjgp7CA6KmWAFmhtZpDyY',1560845523,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('B87r7DR0fDBSnbFsrq0hLuTa07JOhDNu',1560845666,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('BZU8GvgXDzdnrprES5h8Q3rSx9l36Yol',1560850065,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('C68Fd3HRVgKnduUmgesxF_t6lJCUGj29',1560846031,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('C8VyoAgYvLpFJK4q0lps2XAxg9lRjGEw',1560850150,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('Cdkif7MLXf2DBGPGHTXTPbpgO0V7ds24',1560850215,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('DUwEZp8FJZF0GQ4W-DVHVgdBiRxTqgpp',1560846065,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('FVhFxL7QRTxLc_z22EskDAGjSMb--olp',1560850454,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('Gxpr6yE3xb6Su9-1W4YJwQVlWGIFDp5U',1560849029,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('H9JEq7MolVZmCP53p9i0MJpISiYxTKmv',1560850209,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('HIMPgoQv-bo9pPSTTIZGIVQw--c-q6jc',1560844080,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('KZelhWbhEb-Y5nN8L8GPQ-WTPzkma1tT',1560850084,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('LVEUDX1oCeBaH3rFBd2lHutzNLG6boWf',1560846266,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('Lrq17kUy0ZJXaZjwrGVkd8m1pE5ftmzB',1560845672,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('LxsdO5W-0JKO9oVEh4-KWYVtTb71eIO9',1560846352,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('O63h73yO6XRULU4G7wFNMJysGAm6uCAc',1560843950,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('P4W9VWTI9zcLUt2bNOHtwlvhynn_1sgK',1560850382,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('Ph-RF2FAwVE_Ld0kETivMxBz0ZFH74_f',1560850143,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('QMGbD9kcOjnIclKjpDpXk7z3_TGWjAfg',1560846357,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('QQBHAhVshr5VhAIO3jxq-Wi4hncLDqTU',1560850169,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('RvTK396JdEmyBi8eo3G0tRSZQPI85QAm',1560841823,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('TkUMTSvJkLKBv40EX2VuboiOjY1uajui',1560850519,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('UZfnhQt4WvuAjdInz6SufaTLNOq4WFLI',1560846357,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('VMC-HqAETqKeztHE9sBsW9hdDZWLgkgi',1560846097,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('VXTVJiYZmInOvla7ETAV5oozkCKcNXxu',1560850060,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('Vf73-Xlhc5QzvTvQUujwe5RZtjeBc8Zo',1560850389,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('WvKh24msd2kRUnX3-0hlE9IHpJ-hA18T',1560850389,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('XZyfDU5KWEHtux-r7hi-UdTIyIkiqyLt',1560849961,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('YP-3Blu5tp6F9V0OOCmovIuSmPwOEyqY',1560850426,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('ZUb4KcI3ADpQ-Tpcq4z2YkOVseXLiLAT',1560849965,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('ZmkJuo8Xuilgh7X0jmf01eKOoCaFham_',1560850478,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('ZxXF6c0hV_Na3P_q9ELZm3pzUx2zMRaN',1560843964,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('bYo59TAycXG1CBVjJoZKbfJ4mKqHW4o7',1560850460,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('boD8MkK8K174CLNfW-pLBD0LPg1TQTm_',1560782471,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('cBPDg-CW4BWpvl9A_hxSnmwaFjX3ea2B',1560850293,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('cm6yzlyrswUQtMrLuLVNTL3-ccipiUmL',1560855014,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('d9BENIVz___j654qVRQK5YqRH4QkD0q7',1560841822,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('eChFIdrwwm4EfNSrAe2ff-qfu2Z_cinu',1560850454,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('gJy0v7W1eWqpXr4RJCjCP9QnF0AVP_m5',1560846100,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('glotTZh9YHmlMQKorI7CSiYWlaUhppBb',1560856019,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":{\"id\":\"7322721927\",\"username\":\"devrandyazmanreyes\",\"profile_picture\":\"https://scontent.cdninstagram.com/vp/42c69a27959d068da58cec0371d8d427/5D931429/t51.2885-19/s150x150/32213491_1673827729383245_7911568512169017344_n.jpg?_nc_ht=scontent.cdninstagram.com\",\"full_name\":\"Dev Randy Azman Reyes\",\"bio\":\"\",\"website\":\"\",\"is_business\":false,\"counts\":{\"media\":0,\"follows\":3,\"followed_by\":2},\"accessToken\":\"7322721927.4fcb3f8.ab401279b4d94ab4a9950c36ff519821\",\"lastLogin\":\"2019-06-16 09:34:11\"}}}'),('hZmH5xcMyuNR_UiO_qme2ck6NCcPHN5l',1560841822,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('i6WlBRvoSV2DvQzpMDeYLYnHyt_SK2zn',1560843961,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('iFVTXdL2p_eUsbZYWdvorF7CUPyLKKV4',1560846258,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('iYcwf3mh9mLU3vRXqGSVTR-L1CFBvs4c',1560844001,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('jp2tRPQ67053TMJWjvYzmwNlgYqH8pmH',1560849987,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('kBEu1sl_YJzlIIKBY5A1-YQ7OQ9LWVAU',1560845530,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('kbOCZ0VMd5kk4MAK0ioTcaKLXnl7iYGb',1560844021,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('kzvNldyhD3ppWj9sh4PS9kAXKFw67vXt',1560835464,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('oCzgh1AWGuGFsjTvoJrqPQQNxLrqxWIm',1560846360,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('oOP7JK-92MP70fmDq_zBiQ-LNuajpKBa',1560855439,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('pBLe49-0gUG-66ga-ln4-tsQ2mL9Ao87',1560848980,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('pIO8fD9WMuc0UsGesSK7j4sjDEhOeGU_',1560845548,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('rv07NKqMo54DjPxMNr39SThElzyf9HmV',1560850209,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('sEHaOSLpSuG73Rn0PR8HKDf4RYnam3iC',1560852942,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('tZK272IJzJH-RqmfmPhTM4H5u2GdIYXs',1560850382,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('vPzIVIB1JHr_Dody0RldsSZzdmCN5Zcn',1560835459,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('x76_hJnVo0FljlL03tiZb9hLbSQ91IHB',1560844021,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('yBPx632-dRmr5fMoHUh2PTGEQfX_p7_B',1560846344,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('yIZgS8x-IuYECOOclomvdcSOk9Dox7uf',1560845784,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('yoTXg8fZmQgrDJaiRHUfWfYfIx3jD1UF',1560845544,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),('zsSQGjpCzqgxLtIubFplk5dhNmGR0Ci5',1560845519,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stripe`
--

DROP TABLE IF EXISTS `stripe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `stripe` (
  `instagram_id` varchar(64) NOT NULL,
  `stripe_id` varchar(64) NOT NULL,
  `access_token` varchar(128) NOT NULL,
  `refresh_token` varchar(128) NOT NULL,
  `stripe_publishable_key` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stripe`
--

LOCK TABLES `stripe` WRITE;
/*!40000 ALTER TABLE `stripe` DISABLE KEYS */;
INSERT INTO `stripe` VALUES ('7322721927','acct_1CGKaSJwgyOYOMs8','sk_test_N5CaVcs4ek9VqMEKTvcElZpL00ZngrRk2I','rt_FCzew136BEbaSlDfIlLKjQsUOU5Yhm8HR6exLKCWlmxl5sNY','pk_test_BnFMXZiCnL7JGttXrvNigYuA00pLPGNFzq');
/*!40000 ALTER TABLE `stripe` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user_info` (
  `user_id` int(100) NOT NULL,
  `user_name` varchar(100) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `token` int(11) NOT NULL,
  `tokenSecret` int(11) NOT NULL,
  `profile` int(11) NOT NULL,
  `rate` int(12) NOT NULL DEFAULT '50',
  `last_pay_date` datetime DEFAULT NULL,
  `previous_pay_date` datetime DEFAULT NULL,
  `pay_auth_count` int(12) NOT NULL DEFAULT '0',
  `last_login` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


--
-- Dumping data for table `user`
--



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-06-17 23:17:26
