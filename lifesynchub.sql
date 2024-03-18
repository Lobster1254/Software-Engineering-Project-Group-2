-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: lifesynchub
-- ------------------------------------------------------
-- Server version	8.0.36

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
-- Table structure for table `discountedproducts`
--

DROP TABLE IF EXISTS `discountedproducts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discountedproducts` (
  `discount_ID` int NOT NULL,
  `product_ID` varchar(50) NOT NULL,
  PRIMARY KEY (`discount_ID`,`product_ID`),
  KEY `product_ID` (`product_ID`),
  CONSTRAINT `discountedproducts_ibfk_1` FOREIGN KEY (`discount_ID`) REFERENCES `discounts` (`discount_ID`),
  CONSTRAINT `discountedproducts_ibfk_2` FOREIGN KEY (`product_ID`) REFERENCES `products` (`product_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `discounts`
--

DROP TABLE IF EXISTS `discounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discounts` (
  `discount_ID` int NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date NOT NULL,
  `category` varchar(30) DEFAULT NULL,
  `set_price` float(8,2) DEFAULT NULL,
  `percent_off` tinyint DEFAULT NULL,
  `type` enum('percent_off','set_price') NOT NULL,
  `scope` enum('product_list','category') NOT NULL,
  PRIMARY KEY (`discount_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `helpfulnessratings`
--

DROP TABLE IF EXISTS `helpfulnessratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `helpfulnessratings` (
  `rating` boolean NOT NULL,
  `user_ID` varchar(50) NOT NULL,
  `review_user_ID` varchar(50) NOT NULL,
  `product_ID` varchar(50) NOT NULL,
  PRIMARY KEY (`product_ID`,`user_ID`),
  KEY `product_ID` (`product_ID`,`review_user_ID`),
  CONSTRAINT `helpfulnessratings_ibfk_1` FOREIGN KEY (`product_ID`, `review_user_ID`) REFERENCES `productreviews` (`product_ID`, `user_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orderproducts`
--

DROP TABLE IF EXISTS `orderproducts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderproducts` (
  `order_ID` int NOT NULL,
  `product_ID` varchar(50) NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`product_ID`,`order_ID`),
  KEY `order_ID` (`order_ID`),
  CONSTRAINT `orderproducts_ibfk_1` FOREIGN KEY (`order_ID`) REFERENCES `orders` (`order_ID`),
  CONSTRAINT `orderproducts_ibfk_2` FOREIGN KEY (`product_ID`) REFERENCES `products` (`product_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_ID` int NOT NULL,
  `user_ID` varchar(50) NOT NULL,
  `date_made` date NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `products_cost` float(12,2) NOT NULL,
  `tax_cost` float(12,2) NOT NULL,
  `shipping_cost` float(12,2) NOT NULL,
  `delivery_address` varchar(200) NOT NULL,
  `billing_address` varchar(200) NOT NULL,
  `status` enum('not shipped','shipped','delivered','returned','canceled') NOT NULL,
  PRIMARY KEY (`order_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `productreviews`
--

DROP TABLE IF EXISTS `productreviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productreviews` (
  `score` int NOT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `user_ID` varchar(50) NOT NULL,
  `product_ID` varchar(50) NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`product_ID`,`user_ID`),
  CONSTRAINT `productreviews_ibfk_1` FOREIGN KEY (`product_ID`) REFERENCES `products` (`product_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_ID` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `stock` int NOT NULL,
  `price` float(8,2) NOT NULL,
  `height_in` float(5,2) NOT NULL,
  `width_in` float(5,2) NOT NULL,
  `length_in` float(5,2) NOT NULL,
  `category` varchar(30) DEFAULT NULL,
  `weight_oz` int NOT NULL,
  `color` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`product_ID`),
  FULLTEXT KEY `name` (`name`,`description`,`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `shoppingcartproducts`
--

DROP TABLE IF EXISTS `shoppingcartproducts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shoppingcartproducts` (
  `user_ID` varchar(50) NOT NULL,
  `product_ID` varchar(50) NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`product_ID`,`user_ID`),
  KEY `user_ID` (`user_ID`),
  CONSTRAINT `shoppingcartproducts_ibfk_1` FOREIGN KEY (`user_ID`) REFERENCES `shoppingcarts` (`user_ID`),
  CONSTRAINT `shoppingcartproducts_ibfk_2` FOREIGN KEY (`product_ID`) REFERENCES `products` (`product_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `shoppingcarts`
--

DROP TABLE IF EXISTS `shoppingcarts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shoppingcarts` (
  `user_ID` varchar(50) NOT NULL,
  `cost` float(12,2) NOT NULL,
  PRIMARY KEY (`user_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-03-18  1:36:01
