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
-- Dumping data for table `discountedproducts`
--

LOCK TABLES `discountedproducts` WRITE;
/*!40000 ALTER TABLE `discountedproducts` DISABLE KEYS */;
INSERT INTO `discountedproducts` VALUES (1,'3ZX1AWOVAHHH'),(2,'3ZX1AWOVAHHH'),(3,'3ZX1AWOVAHHH'),(3,'4M4X0X5X9IX5'),(4,'4M4X0X5X9IX5');
/*!40000 ALTER TABLE `discountedproducts` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `discounts`
--

LOCK TABLES `discounts` WRITE;
/*!40000 ALTER TABLE `discounts` DISABLE KEYS */;
INSERT INTO `discounts` VALUES (1,'2024-03-19','2025-03-19',NULL,350.00,NULL,'set_price','product_list'),(2,'2024-03-19','2025-03-19',NULL,400.00,NULL,'set_price','product_list'),(3,'2024-03-19','2025-03-19',NULL,NULL,50,'percent_off','product_list'),(4,'2024-03-19','2025-03-19',NULL,NULL,50,'percent_off','product_list');
/*!40000 ALTER TABLE `discounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `helpfulnessratings`
--

DROP TABLE IF EXISTS `helpfulnessratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `helpfulnessratings` (
  `rating` tinyint(1) NOT NULL,
  `email` varchar(320) NOT NULL,
  `review_email` varchar(320) NOT NULL,
  `product_ID` varchar(50) NOT NULL,
  PRIMARY KEY (`product_ID`,`review_email`,`email`),
  CONSTRAINT `helpfulnessratings_ibfk_1` FOREIGN KEY (`product_ID`, `review_email`) REFERENCES `productreviews` (`product_ID`, `email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `helpfulnessratings`
--

LOCK TABLES `helpfulnessratings` WRITE;
/*!40000 ALTER TABLE `helpfulnessratings` DISABLE KEYS */;
INSERT INTO `helpfulnessratings` VALUES (0,'user4@email.com','user2@email.com','2UJY4ZREWNXE'),(1,'user4@email.com','user3@email.com','2UJY4ZREWNXE');
/*!40000 ALTER TABLE `helpfulnessratings` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `orderproducts`
--

LOCK TABLES `orderproducts` WRITE;
/*!40000 ALTER TABLE `orderproducts` DISABLE KEYS */;
/*!40000 ALTER TABLE `orderproducts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_ID` int NOT NULL,
  `email` varchar(320) NOT NULL,
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
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (12345678,'rick.patel03@gmail.com','2024-04-22','VISA 1001',21.99,2.01,0.00,'100 Sicard St, New Brunswick, NJ, 08901','100 Sicard St, New Brunswick, NJ, 08901','shipped'),(123456789,'rick.patel03@gmail.com','2024-04-22','VISA 1002',20.99,1.01,0.00,'100 Sicard St, New Brunswick, NJ, 08901','100 Sicard St, New Brunswick, NJ, 08901','not shipped');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productreviews`
--

DROP TABLE IF EXISTS `productreviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productreviews` (
  `score` int NOT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `email` varchar(320) NOT NULL,
  `product_ID` varchar(50) NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`product_ID`,`email`),
  CONSTRAINT `productreviews_ibfk_1` FOREIGN KEY (`product_ID`) REFERENCES `products` (`product_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productreviews`
--

LOCK TABLES `productreviews` WRITE;
/*!40000 ALTER TABLE `productreviews` DISABLE KEYS */;
INSERT INTO `productreviews` VALUES (3,NULL,'user@email.com','2UJY4ZREWNXE','2024-03-17 00:00:00'),(1,NULL,'user2@email.com','2UJY4ZREWNXE','2024-03-18 00:00:00'),(1,NULL,'user3@email.com','2UJY4ZREWNXE','2024-03-19 00:00:00');
/*!40000 ALTER TABLE `productreviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_ID` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `material` varchar(50) DEFAULT NULL,
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
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('0T6B2TH45TXL','GoPro Hero 4 Silver Edition Action Camcorder With Built-in Touch Screen + 40-in-1 GoPro Action Camera Accessories Kit',NULL,'<li>Built-In Touch Display: Frame your shots. Easily adjust settings. Play back videos and photos. Improved Camera Control: New dedicated button enables quick access to camera settings. Simplified</li>',24,217.99,1.00,18.00,4.00,'camera',13,NULL),('0TL5QIC0BH9H','Microsoft Surface Pro 9 13\" Tablet, Intel i5, 8GB/256GB, Platinum (QEZ00001) - Refurbished',NULL,'null',82,749.99,1.00,15.00,5.00,'tablet',25,NULL),('0V4HCGFZY2UX','Restored Microsoft Surface Pro 6th Gen - 12.3\" Intel Core I5 8GB RAM 128GB SSD Windows 10 Pre-Owned',NULL,'<li>Display: 12.3-inch 2736 x 1824</li><li>Processor: 8th Gen Intel Core i5-8250U Quad-core, 8 threads, 1.60GHz GPU: Intel UHD Graphics 620</li><li>RAM: 8GB 1866 MHz LPDDR3 Storage: 128GB SSD</li>',74,243.52,1.00,16.00,21.00,'tablet',18,NULL),('0WALEZ0ZXLTS','Microsoft Surface Pro 4 12.3-inch 2-in-1 Tablet w/ Keyboard - 6th Gen Intel Core m3-6Y30 4GB RAM 128GB SSD Windows 10 Pro (Used Grade B)',NULL,'<li class=\"item\"><b>Refurbished Grade B Microsoft Surface Pro 4 Tablet</b></li><li class=\"item\"><b>6th Generation Intel Core m3-6Y30 Processor</b></li><li class=\"item\"><b>4M Cache, up to 2.20 GHz</b></li><li class=\"item\"></li>',82,199.00,2.00,1.00,24.00,'tablet',30,NULL),('0XHFDRTOROLS','2-Pack for PlayStation PS4 Dual Controller LED Charger Dock Station USB Fast Charging Stand',NULL,'<li>Compatible with:GoPro HERO5 BlackGoPro AABAT-001GoPro 601-10197-000NOT COMPATIBLE with the GoPro HERO5 Session, HERO4, or HERO3</li><li>Battery Voltage: 3.85v</li><li>Battery type: Li-ion</li>',41,15.99,2.00,8.00,17.00,'camera',17,NULL),('0Y9SS6L40COS','Microsoft Surface Pro 3 Intel Core i5 4300U (1.90 GHz) 4 GB Memory 128 GB SSD 12.0\" 2160 x 1440 Used (Grade C)',NULL,'Microsoft Surface Pro 3 4GB/128GB - MQ2-00001Microsoft combines the portability of a tablet and the performance of a laptop with the Surface Pro 3 128GB 12\" Multi-Touch Tablet. Weighing just 1.76',94,229.99,1.00,10.00,21.00,'tablet',28,NULL),('10R5T1I5AR77','GoPro HERO12(HERO 12) Waterproof Action Camera 5.3K60 Ultra HD Video,27MP Photos, HDR, 1/1.9\" Image Sensor, Live Streaming, Webcam, + High Speed 64GB Card, 50 Piece Accessory Kit and 2 Extra Batteries',NULL,'Dive into the Action: Experience the thrill of exploring the depths with the fully waterproof HERO 12 Black, now tougher and more resilient than ever before. Whether you\'re conquering muddy trails,',90,439.01,1.00,2.00,18.00,'camera',15,NULL),('14ZL220DJRIV','Ultimaxx Chest Mount for All GoPro\'s and Most Other Action Cameras',NULL,'Shoot hands free With your camera secured to your chest you can capture the action without having to hold the camera in your hands. Ultimaxx chest strap lets you wear all GoPro Hero cameras on your',6,8.99,2.00,9.00,22.00,'camera',13,NULL),('1630A6VDA9MV','GoPro HERO11 Black E-Commerce Packaging - Waterproof Action Camera with 5.3K60 Ultra HD Video, 27MP Photos, 1/1.9\" Image Sensor, Live Streaming, Webcam, Stabilization',NULL,'Revolutionary New Image Sensor: expansive field of view ever on a HERO camera out of the box. This gives you an extra-large canvas for your creativity by capturing more of the sky and horizon in every',40,295.99,1.00,12.00,21.00,'camera',15,NULL),('16K5RKQIMEEZ','Battery AHDBT-201, AHDBT-301, AHDBT-302 for GoPro HERO 3 Cameras',NULL,'<li>100% Compatible with original manufacturer equipment and chargers</li><li>AC/DC Home and Car Charger</li><li>Li-Ion Long Life Battery</li><li>Battery Pouch for GPH3</li>',86,12.99,1.00,1.00,4.00,'camera',2,NULL),('1GEPGX2H2OB7','Open Box Dell Latitude 7000 7320 13.3\" Tablet - Full HD - 1920 x 1080 - Intel',NULL,'Screen/Display size : 13.3||Hard Drive/Data Storage : 512||Processor Cores : Quad Core',14,544.49,1.00,21.00,2.00,'tablet',22,NULL),('1GFIBIDQZD6C','Restored Microsoft Surface 3 7G500015 Tablet 10.8\", 64GB, Intel Atom x7Z8700 (Refurbished)',NULL,'<li>Microsoft combines the portability of a tablet and the performance of a laptop with the 10.8\" Surface 3 Multi-Touch Tablet. Weighing just 1.37 pounds and measuring just 0.34\" thin, the Surface 3</li>',96,124.99,2.00,17.00,7.00,'tablet',25,NULL),('1GGKQ6HV3KSL','GoPro Head Strap + QuickClip - ACHOM-001',NULL,'null',10,16.99,1.00,1.00,17.00,'camera',16,NULL),('1HU9ZR2MBPHD','UltraPro 4-Pack AHDBT-401 High-Capacity Replacement Batteries with Rapid Dual Charger for GoPro Hero4. Also Includes: Camera Cleaning Kit, Camera Screen Protector, Mini Travel Tripod',NULL,'Keep shooting all day (and longer) with the UltraPro 4 Pack-Battery & Charger Kit. With four (4) extended-life high capacity batteries, a compact Rapid Dual-Battery USB Travel Charger, and additional',48,29.95,2.00,12.00,7.00,'camera',17,NULL),('1JIF87APXOEP','GoPro HERO10 Black- E-Commerce Packaging - Waterproof Action Camera with Front LCD & Touch Rear Screens, 5.3K60 Ultra HD Video',NULL,'REVOLUTIONARY PROCESSOR: Faster. Smoother. Better. The powerful new GP2 engine changes the gamesnappy performance, responsive touch controls and double the frame rate for amazingly smooth footage.',6,244.00,1.00,7.00,22.00,'camera',30,NULL),('1LADKHXRYNJG','Open Box Microsoft Surface 3 10.8\" x7-Z8700 4GB 64GB SSD WIFI LTE NO KEYBOARD - ENGRAVED',NULL,'The item in this listing is an Open Box (packaging maybe slightly distressed). The unit powers on with factory settings restored and includes the original accessories. The unit may have some minor',79,131.15,2.00,13.00,24.00,'tablet',5,NULL),('1O9C9XOFJQ6X','Battery for GoPro HERO3/HERO3+ Camera, 1500mAh + eCostConnection Microfiber Cloth | AHDBT-301/AHDBT-302',NULL,'<li>GPH3 Replacement</li><li>High Quality</li><li>Perfect backup</li>',43,8.49,1.00,21.00,15.00,'camera',2,NULL),('1R3KWRQZAHGG','Restored Ematic EWT834 Intel 8\" 16GB with Windows 10 Quad-Core Touchscreen Tablet with Bluetooth 4.0 Black (Refurbished)',NULL,'Merchandise',55,48.99,1.00,13.00,2.00,'tablet',9,NULL),('1SSWGHCJRF2A','Meromore Fence Mount, Action Camera Aluminum Fence Mount for GoPro, iPhone, Phones, Digital Camera, Ideal Backstop Camera Fence Clip for Recording Baseball, Softball, Football Games',NULL,'null',55,35.99,2.00,18.00,6.00,'camera',25,NULL),('1TASPQ8E6XV5','2x Pack - GoPro Hero4 Battery Replacement - For GoPro AHDBT-401, AHBBP-401 Digital Camera Battery (1160mAh, 3.8V, Lithium-Ion)',NULL,'<li>Replacement GoPro AHDBT-401 Battery</li><li>Replacement for GoPro Hero4 Digital Camera Batteries</li><li>Quantity: 2, Lifetime Warranty</li><li>Capacity: 1160mAh, Upstart Battery Brand</li><li>On</li>',66,22.98,1.00,7.00,16.00,'camera',16,NULL),('1TI7GZFDQ7Q0','CHUWI UBook X 12\" Gaming Tablet+KeyBoard+H8 Stylus Pen,512G SSD 12G ROM,Windows 11,intel Core i5-10210Y,2 in 1 Gaming/Workshop Tablet Laptop PC,2160*1440 2K IPS Display,2023 New Upgrade',NULL,'null',13,375.00,1.00,16.00,1.00,'tablet',18,NULL),('1UQD68VJ7JPL','GoPro LCD Touch Screen BacPac ALCDB-301 fits Hero 3, 3+, 4 Extrernal Display for GoPro Display Monitor Viewer',NULL,'<li>Removable touch display</li><li>Seamlessly attaches to the back of your GoPro for added convenience and control</li><li>Play back content instantly with this GoPro BacPac</li><li>View the videos</li>',83,35.99,2.00,8.00,16.00,'camera',1,NULL),('1UR1NWA3B8UX','Ematic 8.95\" 32GB Tablet Windows 10 with Keyboard, EWT935DK',NULL,'<li>8.95\" touchscreen</li><li>1.3GHz Intel Atom processor</li><li>32GB of storage memory</li><li>Windows 10 OS</li><li>Webcams, WiFi, and Bluetooth</li>',4,59.90,2.00,8.00,10.00,'tablet',1,NULL),('1XCHQJWETKEW','Microsoft Surface Go (Intel Pentium Gold, 4GB RAM, 64GB) (Used - Excellent)',NULL,'Designed for daily tasks while on the go, the Microsoft Surface Go 10\" 64GB Multi-Touch Tablet provides an optimal balance of laptop performance, tablet portability, and a responsive touchscreen.\n\nThe',42,210.00,2.00,10.00,10.00,'tablet',4,NULL),('20U55R8RX9Q9','Restored Microsoft Surface PRO-4 256 GB Intel Core i5-6300U X2 2.4GHz 12.3\",Silver (Refurbished)',NULL,'<li>This Certified Refurbished product is tested and certified to look and work like new. The refurbishing process includes functionality testing, basic cleaning, inspection, and repackaging. The</li>',61,249.99,1.00,12.00,21.00,'tablet',19,NULL),('29TM6OJ1IUWE','Restored Microsoft Surface Pro 2nd - 10.6\" Intel Core i5 4GB RAM 128GB Storage Windows 10 Pre-Owned',NULL,'<li>Display: 10.6 Inches 1920 x 1080 2M Pixels ClearType Display</li><li>Processor: 4th Gen Intel Core i5 Quad-Core 1.60 2.60 GHz Intel HD Graphics 4400</li><li>RAM: 8GB 1600 MHz LPDDR3 RAM Storage:</li>',67,158.21,1.00,16.00,8.00,'tablet',2,NULL),('2E6QOJ3Z4JNS','Restored GoPro Hero 4 Silver Edition 12MP Waterproof Sports & Action Camera Camcorder Bundle with 35-in-1 Accessories Kit (Refurbished)',NULL,'<li>Built-in touch display for easy camera control, shot-framing and playback,Protune with SuperView delivers cinema-quality capture and advanced manual control for photos and video with the world\'s</li>',40,217.99,2.00,24.00,8.00,'camera',28,NULL),('2IH0PMXX55K5','2.4GHz & Bluetooth Mouse, Rechargeable Wireless LED Mouse for Maxwest Nitro Phablet 71 ALso Compatible with TV / Laptop / PC / Mac / iPad pro / Computer / Tablet / Android - Onyx Black',NULL,'null',62,13.95,1.00,23.00,12.00,'tablet',30,NULL),('2LPTZKSH1S7I','Microsoft Surface Pro 3 Tablet Computer with Keyboard - Intel Core i3-4020Y 1.5GHz, 4GB RAM, 64GB SSD, 12-inch Display, Windows 10 Pro - Used Grade B',NULL,'<li>RefurbishedMicrosoft Surface Pro 3 w/ Keyboard</li><li>Keyboard colors vary</li>\n<li>Intel Core i3-4020Y Processor</li>\n<li>3M Cache,1.50 GHz</li>\n<li>4GB Ram</li>\n<li>64GB SSD Drive</li>\n<li>12\"</li>',92,178.92,2.00,4.00,23.00,'tablet',20,NULL),('2M8SXYPTIH7F','Restored GoPro HERO3 White Edition action camera 1080p 5.0 MP WiFi underwater up to 131.2 ft Camcorder + 35in1 Kits (Refurbished)',NULL,'<li>Professional 1080p 30 fps, 960p 48 fps, and 720p 60 fps and WVGA 240 fps video capture</li><li>12MP photo capture with 10 frames per second burst</li><li>WiFi built in, and compatible with WiFi</li>',77,119.99,2.00,12.00,16.00,'camera',9,NULL),('2QBG9EZ5UUFK','Fotodiox  Go Tough Silicone Mount with Neutral Density 0.6 Filter for Gopro Hero & Hero5 Session Camera',NULL,'Fotodiox GT-H5S-ND4 Go Tough Silicone Mount with Neutral Density 0.6 Filter for Gopro Hero & Hero5 Session Camera',59,14.95,2.00,16.00,16.00,'camera',12,NULL),('2RRP7598R9HF','GoPro HERO12 Black Camera',NULL,'Incredible image quality, even better HyperSmooth video stabilization and a huge boost in battery life come together in the latest and greatest GoPro HERO12 Black. It takes best-in-class 5.3K video',96,379.95,1.00,15.00,23.00,'camera',10,NULL),('2UJY4ZREWNXE','Microsoft Surface Go 3 10.5\" Pixel Sense Display, 10 Point Multi-Touch, Intel Core i3-10100Y, 8GB RAM, 128GB SSD, Platinum, Windows 11, 8VC-00001',NULL,'MS8VC00001<li>Surface Go 3 Tablet</li><li>Power Supply</li><li>Quick Start Guide</li><li>Safety and Warranty Documents</li>Meet Surface Go 3See the most portable Surface touchscreen 2-in-1 in action,',13,589.99,2.00,15.00,4.00,'tablet',2,NULL),('2VJCN18IO6TF','GoPro HERO8 Black Action Camera Bundle with Dual Battery Charger & Bonus Battery - Includes 3 Total Batteries',NULL,'Gopro Merchandise',86,229.82,2.00,11.00,12.00,'camera',12,NULL),('2Y4N794G7V5Z','Ematic EWT900BL 16GB Tablet PC - 8.9\" - IPS Technology - Wireless LAN',NULL,'Ematic EWT900BL 16 GB Net-tablet PC - 8.9\" - In-plane Switching (IPS) Technology - Wireless LAN - Intel Atom - Black',54,62.99,2.00,24.00,2.00,'tablet',20,NULL),('300CJV559BNX','Ematic EWT716 - Tablet - Intel Atom - Win 8.1 - 1 GB RAM - 16 GB - 7\" IPS touchscreen 1024 x 600 - black',NULL,'<li>7.0\" touchscreen</li><li>1.3GHz Intel Atom Quad-Core processor</li><li>16GB of storage memory</li><li>Microsoft Windows 8.1 OS</li><li>Webcam, WiFi and Bluetooth</li>',21,49.95,1.00,3.00,12.00,'tablet',27,NULL),('3148DMEF04LP','LotFancy Camera Accessories Kit Bundle Attachments for Gopro Hero 9 8 7 6 5 4 3 2 1 3+ Max , Fusion, Insta360, DJI Osmo',NULL,'Headband, Wrist Band & J-hook Buckle Mount, Bicycle Mount Accessories & Suction Cup Mount, Telescoping Monopod & Floating Handle Bar, Flat & Curved Surface Adhesive Mounts',18,17.89,1.00,20.00,10.00,'camera',25,NULL),('35AFBG7XKY76','Movo Photo GC34 Rugged Protective Housing Cage with Tripod Mount for GoPro HERO3, HERO3+ and HERO4 Action Camcorders',NULL,'<li>Made from Crush-Resistant ABS</li><li>Ratains Access to Ports & Switches</li><li>Withstands Impact, Crash, Crushing</li>',72,12.95,2.00,13.00,4.00,'camera',21,NULL),('35TN1X7W30CY','Ematic EWT826BK 8 inch 32GB Tablet with Keyboard Dock',NULL,'<li>8\" touchscreen</li><li>1.3GHz Intel Atom Quad-Core processor</li><li>32GB of storage memory</li><li>Microsoft Windows 10 OS</li><li>Webcams, WiFi and Bluetooth</li>',57,94.95,1.00,22.00,9.00,'tablet',8,NULL),('3EPUVAOTBZWO','gpct 26-in-1 mount accessory kit for gopro hero 1/2/3/3+/4/5 camera (includes carrying case, head mount, tripod, arm, handlebar mount and more!)',NULL,'This mount accessory kit provides everything you need to mount your camera for taking nice photos whether in car, on bike, at beach, or in other outdoor adventures.',47,28.02,1.00,20.00,18.00,'camera',14,NULL),('3FL4EIBN2TMG','Microsoft Surface Pro 4 12.3-Inch (4GB RAM, 128GB SSD, Intel Core i5, Windows 10) (Manufacturer Used)',NULL,'<li>Surface Pro 4 powers through everything you need to do, while being lighter than ever before</li><li>The 12.3\" PixelSense screen has extremely high contrast and low glare so you can work through</li>',50,179.00,1.00,19.00,19.00,'tablet',27,NULL),('3KZ7LAXSUNOJ','CHUWI UBook X 12\" Gaming Tablet+KeyBoard+H8 Stylus Pen,512G SSD 12G ROM,Windows 11,intel Core i5-10210Y,2 in 1 Gaming/Workshop Tablet Laptop PC,2160*1440 2K IPS Display,2023 New Upgrade',NULL,'Brand Item model numberHardware PlatformOperating SystemItem WeightProdu',6,375.00,1.00,18.00,22.00,'tablet',2,NULL),('3L8HYX92HTIT','GoPro AGCHM001 Performance Chest Mount',NULL,'GoPro Sports Kit Featuring the Chesty and the Handlebar / Seatpost / Pole Mount, the GoPro Sports kit gives you the tools to wear your GoPro camera totally hands-free in just about all your sporting',51,32.79,2.00,12.00,10.00,'camera',18,NULL),('3LVYFF9GO59X','Microsoft Surface 2 - Tablet - Win 8.1 RT - 32 GB - 10.6\" (1920 x 1080) - USB host - microSD slot - magnesium - Used',NULL,'Key Features and Benefits:<li>Microsoft OfficeSurface 2 pushes the boundaries of what a tablet can do. With touch-optimized versions of Outlook, Word, Excel, PowerPoint, and OneNote, Surface 2 can go</li>',73,149.00,1.00,19.00,16.00,'tablet',29,NULL),('3RPJH0ZA6EO3','Handlebar & Seatpost Mount for Bikes. Use With GoPro HERO1, HERO2, HERO3, HERO3+, HERO4, HERO4 Session, HERO5 & eCostConnection Microfiber Cloth',NULL,'<li>Easy to install and remove / Lightweight and portable</li><li>Ideal for handlebars and any pole-like locations</li><li>Mount allows easy positioning of your camera in order to catch different</li>',36,5.99,2.00,10.00,18.00,'camera',17,NULL),('3UH0M5ULI29Z','Restored HP Tablet 11-inch Intel Pentium Silver N6000 4GB LPDDR4X RAM 128GB SSD Windows 11 Home',NULL,'\n<li>Portable and Versatile - The HP 2-in-1 tablet is designed for convenience and versatility. With its 11 inch size, it\'s perfect for on-the-go productivity and entertainment. Enjoy the benefits of</li>',67,205.99,1.00,11.00,7.00,'tablet',22,NULL),('3Y614WX77S2C','Dell Latitude 7000 7200 Tablet, 12.3\", Core i5 8th Gen i5-8365U Quad-core (4 Core) 1.60 GHz, 8 GB RAM, 256 GB SSD, Windows 10 Pro 64-bit',NULL,'LATITUDE72002IN1I588365U8GB1DIMMS256GBSSW102C12.3IN',44,413.32,1.00,2.00,16.00,'tablet',12,NULL),('3ZX1AWOVAHHH','HIGOLEPC Rugged Tablet Windows 11 Pro 10.1in Intel Celeron N4120 MIL-STD-810G 16000mAh Battery 8GB RAM 128GB ROM 5MP 2MP Cameras',NULL,'HIGOLEPC Rugged Tablet Windows 10 PRO 64-BIT PC Table|10.1-in Display|MIL-STD-810G|16000mAh Battery| Intel Gemini Lake N4120|8GB RAM/128GB ROM|5MP and 2MP Cameras|for Enterprise Work Field.',86,519.99,2.00,18.00,5.00,'tablet',14,NULL),('42997BMBOQ8W','GoPro Green Water Dive Filter (For Super Suit)',NULL,'<li>Provides color correction while capturing footage in green water at depths of 15\'-70\'</li><li>Constructed of scratch-resistant, optical-grade glass for optimal image clarity</li>',21,68.99,1.00,5.00,8.00,'camera',11,NULL),('44ZO03GZBLGJ','GoPro Helmet Front and Side Mount',NULL,'<li>Versatile helmet-mounting solution</li><li>Offers maximum adjustability for a variety of shots and capture angles</li><li>Compatible with all GoPro cameras</li>',57,29.98,1.00,24.00,7.00,'camera',9,NULL),('46YCTONDXUY8','Microsoft Surface Go 3 10.5\" Pixel Sense Flow Display, 10 Point Multi- touch, IntelPentium Gold 6500Y, 8GB RAM, 128GB SSD, Platinum, Windows 11, 8VA-00001',NULL,'- Screen: 10.5 PixelSense Display- Resolution: 1920 x 1280 (220 PPI)- Dual-core Intel Pentium Gold 6500Y Processor- Windows 11 in S Mode- 8GB/128GB- Up to 11 hours of typical device usage- Intel UHD',95,520.00,1.00,13.00,15.00,'tablet',21,NULL),('48YVYOS3S0KK','Ultimaxx 2 Pack Heavy-Duty Buckle Mount For All Action Cameras',NULL,'<li>Compact size, excellent quality and light weight.</li><li>Compatible with all Gopro & Most Other Action Camera Mounts / Adapters.</li><li>Made of high-quality materials for stability and</li>',72,5.99,2.00,17.00,1.00,'camera',22,NULL),('4BZLTD6HTFDL','MAX',NULL,'null',54,463.57,1.00,22.00,21.00,'camera',6,NULL),('4F4WPQCHAQLS','Microsoft Surface Pro 3 Tablet (12-inch, 256 GB, Intel Core i5, Windows 10) + Microsoft Surface Type Cover (Certified Used)',NULL,'<li>Intel i5-4300U (1.9GHz up to 2,9GHz) Intel HD Graphics 4400</li><li>8GB RAM, 256GB Sold State Drive, Micro SD Card Reader</li><li>12-inch Full HD Touchscreen Display (2160x1440) Bluetooth 4.0</li>',13,279.00,1.00,22.00,22.00,'tablet',23,NULL),('4HOZIIVZ0GN4','Ematic EWT900BU 8.9\" HD Quad-Core 16 GB Tablet With Windows 8',NULL,'Ematic 8.9\" Hd Quad-core 16gb Tablet Wit',99,89.95,1.00,8.00,22.00,'tablet',22,NULL),('4M4X0X5X9IX5','Restored Dell RGB Gaming Desktop Computer PC, Intel i5 6th Gen. AMD Radeon RX 550 4GB DDR5, 16GB Ram, 512GB SSD, 22 inch Monitor, BTO RGB Gaming Keyboard Mouse & Headset, WiFi Windows 10 Pro (Renewed)',NULL,'null',97,287.08,1.00,6.00,11.00,'tablet',9,NULL),('4PI9SZDBTLC2','Microsoft Surface Pro 7 12.3in Touchscreen i7-1065G7 16GB RAM 256GB SSD Platinum - Restored',NULL,'null',10,655.00,2.00,12.00,20.00,'tablet',30,NULL),('4QFI4OHRFS0X','Restored GoPro HERO10 Black - Waterproof Action Camera with Front LCD and Touch Rear Screens, 5.3K60 Ultra HD Video, 23MP Photos, 1080p Live Streaming, Webcam, Stabilization - CHDHX-101-CN (Refurbished)',NULL,'<li>Revolutionary Processor: Faster. Smoother. Better. The powerful new GP2 engine changes the gamesnappy performance, responsive touch controls and double the frame rate for amazingly smooth footage.</li>',56,214.97,2.00,24.00,1.00,'camera',27,NULL),('4QN018GA1F4X','2x Pack - GoPro Hero3 Silver Edition Battery - Replacement for GoPro AHDBT-301 Digital Camera Battery (900mAh, 3.7V, Lithium-Ion)',NULL,'<li>Replacement GoPro HD Hero3+ Silver Edition Battery</li><li>Replacement for GoPro AHDBT-301 Digital Camera Batteries</li><li>Quantity: 2, Lifetime Warranty</li><li>Capacity: 900mAh, Upstart Battery</li>',51,22.98,1.00,12.00,10.00,'camera',13,NULL),('4QNV6ZYRMGE0','Ematic 10.1\" Quad-Core Tablet Bundle 16Gb Storage, Bluetooth - Purple EGQ236BDPR',NULL,'Ematic EGQ236 10\" 16GB Android 8.1 Tablet w/ Keyboard Case and Headphones Purple',86,59.99,2.00,21.00,2.00,'tablet',20,NULL),('4RN8VTCE42KL','GoPro HERO 12 Creator Edition - With Volta (Battery Grip, Tripod, Remote), Media Mod, Light Mod, Enduro Battery - Waterproof Action Camera + 64GB Extreme Pro Card and 2 Extra Batteries',NULL,'null',18,634.95,2.00,10.00,19.00,'camera',11,NULL),('4UBSZ0NGPMOY','Restored Microsoft Surface Pro 6 12.3\" Core i5 1.7GHz 8GB RAM 128GB SSD LPZ-00001 (Etching, ) (Refurbished)',NULL,'PRODUCT OVERVIEW:Ultra-slim and versatile. Stay productive in style with Surface Pro 6, now with the latest 8th Gen Intel Core processor. Surface Pen sold separately.KEY FEATURES:A best in class',35,243.52,1.00,10.00,17.00,'tablet',15,NULL),('4UCM30Y175N6','Restored Lenovo Lenovo Miix 630-12Q35 12.3\" Touch Tablet Snapdragon 4GB 128GB SSD W10S (Refurbished)',NULL,'With powerful Snapdragon processing, blazing-fast 4G LTE, and an epic 20-hour battery, the Miix 630 makes everything look easy. Connecting to data networks is a snap. Emails and messages are synced',81,149.99,1.00,21.00,16.00,'tablet',9,NULL),('4WQS5JZULIIS','GoPro ACMPM-001 Jaws Clamp Camera Mount',NULL,'<li>Compatible with GoPro cameras</li><li>Clamps to objects 0.25\"-2\" in diameter</li><li>Removable neck allows a wider range of camera angles</li>',39,49.98,1.00,12.00,5.00,'camera',3,NULL),('4YXSQS8FWHXJ','50\" inch aluminum camera tripod with built in bubble leveler goes for all gopro hero cameras + ecostconnection microfiber cloth',NULL,'<li>50\" Tripod Extends to 50 Inches</li><li>3 section aluminum alloy legs, Quick Release Plate</li><li>Tripod Mount Adapter for GoPro HERO</li><li>Enables you to capture those perfect shots</li><li>+</li>',52,15.99,1.00,5.00,8.00,'camera',19,NULL),('4ZFA1O62H5TF','CHUWI UBook 11.5\" Tablet,256GB ROM 8GB RAM,intel Gemini-Lake,WIFI,Windows Gaming/Workstation Tablet,FM,1920*1080 IPS Display',NULL,'CHUWI\'s Android 2-in-1 Tablet HiPad Air, 10.3-inch all metal integrated body, made by CNC technology. This tablet uses an 8-core chip and is equipped with a G52 850mhz high-performance graphics card',49,139.00,1.00,6.00,19.00,'tablet',30,NULL),('4ZQ04ZA2W2FP','GoPro HERO12(HERO 12) Black  Waterproof Action Camera 5.3K60 Ultra HD Video, 27MP Photos, HDR, Image Sensor, Live Streaming, Webcam, Stabilization + 64GB Memory Card & DigiNerds 50 Piece Accessory Kit',NULL,'Dive into the Action: Experience the thrill of exploring the depths with the fully waterproof HERO 12 Black, now tougher and more resilient than ever before. Whether you\'re conquering muddy trails,',97,389.99,2.00,21.00,9.00,'camera',10,NULL),('54WAN0YKYLIX','Microsoft Surface Pro 2 - 128GB, Haswell i5 Processor, 10.6\" Full HD Display, Windows 8.1 Pro - Dark Titanium (Used)',NULL,'<li>4GB RAM Memory, 128GB Flash Memory (expandable via microSD card slot)</li><li>Intel 4th Generation (Haswell) Core i5 Processor</li><li>10.6-inch 10-point multi-touch ClearType Full HD Display</li>',24,179.00,1.00,7.00,2.00,'tablet',4,NULL),('56IS7IJIVAB8','Fotodiox WPGT-H3Pls-Adapter Pro WonderPana Go H3 Plus Filter Adapter',NULL,'Fotodiox WPGT-H3Pls-Adapter Pro WonderPana Go H3 Plus Filter Adapter',71,4.95,1.00,15.00,4.00,'camera',5,NULL),('5GRGAOFRF37L','Vivitar Pro Camera Mount',NULL,'<il>Brand: Top Brand</il></li><il>UPC: 681066441701</il></li><il>Warranty:</il></li>',29,39.99,2.00,11.00,3.00,'camera',13,NULL),('5I6YA30LP69V','Microsoft Surface Pro 3 - Tablet - Core i5 4300U / 1.9 GHz - Win 8.1 Pro 64-bit - 4 GB RAM - 128 GB SSD - 12\" touchscreen 2160 x 1440 (Full HD Plus) - HD Graphics 4400 - Wi-Fi 5 - silver - Used',NULL,'<li>This Certified Refurbished product is manufacturer refurbished, shows limited or no wear, and includes all original accessories plus a 1-year limited hardware warranty.</li><li>The tablet that can</li>',39,209.88,1.00,2.00,19.00,'tablet',9,NULL),('5IYMNFSC1ZY9','Open Box Microsoft Surface Go 2 10.5 1920x1280 Pentium Gold 4425Y 4GB 64GB SSD Win 10 Pro',NULL,'The item in this listing is an Open Box (packaging maybe slightly distressed). The unit powers on with factory settings restored and includes the original accessories. The unit may have some minor',79,197.66,2.00,13.00,19.00,'tablet',27,NULL),('5JA3LRIMG9U6','Ringke Floating Strap (2 Pack) Universal Waterproof Float For All Devices: GoPro, Digital Camera, Mobile Phones, And More - Palm Leaves+Banana',NULL,'<li>Weight Support - Ringke Floating Strap holds up to 5 ounces / 150 grams. We highly recommend pairing with the Ringke Waterproof Phone Pouch for better flotation and extra layer of protector. It is</li>',17,13.99,2.00,3.00,13.00,'camera',13,NULL),('5KY3EU77IK9T','UltraPro 3-Pack AHDBT-401 High-Capacity Replacement Batteries with Rapid Travel Charger for GoPro Hero4. Also Includes: Camera Cleaning Kit, Camera Screen Protector, Mini Travel Tripod',NULL,'Keep shooting all day (and longer) with the UltraPro 3 Pack-Battery & Charger Kit. With three (3) extended-life high capacity batteries, a compact AC/DC travel charger, and additional handy',93,44.99,1.00,15.00,14.00,'camera',15,NULL),('5SW30PME8H4Y','Adjustable Neck/Shoulder Lanyard, Mount for GoPro, Quick Install Tripod Mount Screw and a Microfiber Cleaning Cloth - Fast and Secure Connection to Your GoPro, DSLR or Camera',NULL,'CamKix GoPro and Camera Lanyard Mount Pack The lanyard can be use as a neck band and as a shoulder strap. It\'s adjustable in length to allow a comfortable and secure position of your GoPro Hero',89,4.99,2.00,5.00,16.00,'camera',3,NULL),('5ZAIP431D9GN','RAM Mounts Mounting Adapter for Camera',NULL,'RAM 1\" Ball Adapter for GoProMounting BasesFor anyone who needs more versatility from their GoPro mounting solution, look no further than the RAM Adapter for GoPro Bases. Utilizing the RAM ball and',90,11.99,2.00,20.00,7.00,'camera',18,NULL),('5ZBYYKFJNKCD','GoPro Protective Lens + Covers - ALCAK-302',NULL,'<li>Compatible with HERO3/HERO3+ cameras</li><li>Protects camera lens when outside the housing</li><li>Perfect for handheld shooting</li>',61,29.99,2.00,19.00,22.00,'camera',4,NULL),('5ZG17U5PXZ0E','Refurbished GoPro HERO3 CHDHE-301 Camcorder - Silver',NULL,'null',11,243.00,1.00,2.00,14.00,'camera',7,NULL),('60FRLMTHJQCK','Ultimaxx Underwater Waterproof LED Light with Bracket for Action Cameras',NULL,'No matter you are underwater, on land or in a poorly-lit room, this light will always brighten up your footage.',84,24.95,1.00,21.00,23.00,'camera',21,NULL),('63HCYXQHLVXJ','Supersonic SC-4032WKB - Tablet - with detachable keyboard - Intel - Windows 10 - 4 GB RAM - 32 GB SSD - 10.1\" IPS touchscreen 1280 x 800 - gray',NULL,'10.1 Capacitive Touchscreen Display Tablet and fully detachable Keyboard, Powered by Windows 10 Operating System, Quad Core 1.84GHz Intel Processor, Bluetooth 4.0 Compatible Allows You to Connect Most',69,254.99,2.00,13.00,18.00,'tablet',12,NULL),('6B997N6X3PCJ','Manfrotto Pixi Xtreme Mini Tripod Black with Tripod Mount Adaptor for GoPro',NULL,'<li>Load Capacity2.2lbs / 0.99kg</li><li>LengthWhen Closed: 8.5\" / 21.59cm</li><li>Weight0.44lbs / 0.19kg</li>',47,39.88,1.00,9.00,24.00,'camera',2,NULL),('6CJSRDSKHN36','Restored Dell RGB Gaming Desktop Computer PC, Intel i5 6th Gen. AMD Radeon RX 550 4GB DDR5, 16GB Ram, 512GB SSD, 22 inch Monitor, BTO RGB Gaming Keyboard Mouse & Headset, WiFi Windows 10 Pro (Renewed)',NULL,'<li>Detailed Specifications:</li><li>Dell OptiPlex RGB Computer: \"Small Size, Accelerated Performance\"</li><li>Easy Setup and Customization:</li><li>Setting up and customizing the desktop is a breeze,</li>',55,287.08,2.00,17.00,7.00,'tablet',11,NULL),('6CYA6OI9EC00','Microsoft Surface Pro 6 Intel Core i7 16GB RAM 512GB Solid State Drive SSD 2-in-1 Tablet With Keyboard Touchscreen Display Windows 10 Pro Used',NULL,'<li>512 Solid State Drive</li><li>Intel Core i7-8650U</li><li>90-Day Warranty plus Free Technical Support</li>',10,599.00,1.00,10.00,18.00,'tablet',29,NULL),('6EOU64FWS64O','Restored Apple iPad 5 (2017) A9 Processor 128GB Storage Wi-Fi and Bluetooth with Pro 6 Wireless Earbuds (Space Gray) (Refurbished)',NULL,'Profesionaly Refurbished by a Microsoft Authorized Partner.1 Year Warranty with Free Tech SupportFast Intel Quad Core i5 ProcessorAuthentic Windows Software',35,138.00,2.00,12.00,10.00,'tablet',18,NULL),('6P9Y1493Q27B','Soft Silicone Lens Cover Cap for GoPro HERO3+ / HERO4 Camera Housing Case',NULL,'<li>A small attached cap for the On/Off button provides some protection from the camera turning on or off by accident</li><li>GoPro camera / GoPro camera housing are not included</li><li>Note: Color</li>',46,8.99,1.00,14.00,6.00,'camera',10,NULL),('6Y1VJRJC1WPU','Microsoft QIL-00001 Surface Pro 9 13\" Touch Tablet, Intel i7, 16GB/256GB, Platinum Bundle with Microsoft Surface Pro Signature Mechanical Keyboard, Black and 1 Year Extended Warranty',NULL,'EWE90MSQIL00001<li>INCLUDED IN THE BOX:</li><li>Microsoft Surface Pro 9 13\" Touch Tablet, Intel i7, 16GB/256GB, Platinum (QIL-00001)</li><li>Power Supply</li><li>Quick Start Guide Safety and Warranty</li>',84,1339.99,2.00,14.00,22.00,'tablet',7,NULL),('73GXNC4K1GHS','Restored Microsoft Surface Pro 4 with Type Cover Silver - i5-6300u 2.4GHz 8GB 12.3Inch 256GB SSD (Scratch and Dent) (Refurbished)',NULL,'We aim to show you accurate product information.Manufacturers, suppliers and others provide what you see here, and we have not verified it.See our disclaimer',6,229.00,2.00,12.00,13.00,'tablet',27,NULL),('79AQHIRU7FHI','GoPro HERO11 Black Camera',NULL,'Gopro Merchandise',92,299.00,1.00,23.00,9.00,'camera',24,NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shoppingcartproducts`
--

DROP TABLE IF EXISTS `shoppingcartproducts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shoppingcartproducts` (
  `email` varchar(320) NOT NULL,
  `product_ID` varchar(50) NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`product_ID`,`email`),
  KEY `email` (`email`),
  CONSTRAINT `shoppingcartproducts_ibfk_1` FOREIGN KEY (`email`) REFERENCES `shoppingcarts` (`email`),
  CONSTRAINT `shoppingcartproducts_ibfk_2` FOREIGN KEY (`product_ID`) REFERENCES `products` (`product_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shoppingcartproducts`
--

LOCK TABLES `shoppingcartproducts` WRITE;
/*!40000 ALTER TABLE `shoppingcartproducts` DISABLE KEYS */;
/*!40000 ALTER TABLE `shoppingcartproducts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shoppingcarts`
--

DROP TABLE IF EXISTS `shoppingcarts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shoppingcarts` (
  `email` varchar(320) NOT NULL,
  `cost` float(12,2) NOT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shoppingcarts`
--

LOCK TABLES `shoppingcarts` WRITE;
/*!40000 ALTER TABLE `shoppingcarts` DISABLE KEYS */;
/*!40000 ALTER TABLE `shoppingcarts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `email` varchar(320) NOT NULL,
  `passhash` char(60) NOT NULL,
  `temppasshash` char(60) DEFAULT NULL,
  `temppassdt` datetime DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-04-22 22:40:59
