/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50743 (5.7.43-log)
 Source Host           : localhost:3306
 Source Schema         : demo

 Target Server Type    : MySQL
 Target Server Version : 50743 (5.7.43-log)
 File Encoding         : 65001

 Date: 15/05/2025 09:35:07
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for customers
-- ----------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `company` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `customer_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `customer_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `customer_age` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `customer_occupation` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `purchase_count` int(11) NULL DEFAULT NULL,
  `total_spent` decimal(10, 2) NULL DEFAULT NULL,
  `avg_order_amount` decimal(10, 2) NULL DEFAULT NULL,
  `last_purchase_date` datetime NULL DEFAULT NULL,
  `registration_date` datetime NULL DEFAULT NULL,
  `preferred_payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_vip` tinyint(1) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_email`(`email`) USING BTREE,
  INDEX `idx_phone`(`phone`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 301 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `product_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `unit_price` decimal(10, 2) NULL DEFAULT NULL,
  `cost_price` decimal(10, 2) NULL DEFAULT NULL,
  `combination` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_product_code`(`product_code`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 501 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for sales_records
-- ----------------------------
DROP TABLE IF EXISTS `sales_records`;
CREATE TABLE `sales_records`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NULL DEFAULT NULL,
  `customer_id` int(11) NULL DEFAULT NULL,
  `amount` decimal(10, 2) NULL DEFAULT NULL,
  `payment_amount` decimal(10, 2) NULL DEFAULT NULL,
  `received_amount` decimal(10, 2) NULL DEFAULT NULL,
  `actual_price` decimal(10, 2) NULL DEFAULT NULL,
  `profit` decimal(10, 2) NULL DEFAULT NULL,
  `total_profit` decimal(10, 2) NULL DEFAULT NULL,
  `quantity` int(11) NULL DEFAULT NULL,
  `discount` decimal(4, 2) NULL DEFAULT NULL,
  `inquiry_time` datetime NULL DEFAULT NULL,
  `quotation_time` datetime NULL DEFAULT NULL,
  `create_time` datetime NULL DEFAULT NULL,
  `order_time` datetime NULL DEFAULT NULL,
  `payment_time` datetime NULL DEFAULT NULL,
  `delivery_time` datetime NULL DEFAULT NULL,
  `receive_time` datetime NULL DEFAULT NULL,
  `review_time` datetime NULL DEFAULT NULL,
  `quotation_delay` int(11) NULL DEFAULT NULL,
  `order_delay` int(11) NULL DEFAULT NULL,
  `payment_delay` int(11) NULL DEFAULT NULL,
  `delivery_delay` int(11) NULL DEFAULT NULL,
  `total_process_days` int(11) NULL DEFAULT NULL,
  `year` int(11) NULL DEFAULT NULL,
  `quarter` int(11) NULL DEFAULT NULL,
  `month` int(11) NULL DEFAULT NULL,
  `week` int(11) NULL DEFAULT NULL,
  `day_of_week` int(11) NULL DEFAULT NULL,
  `relation_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `region` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `channel` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_coupon_used` tinyint(1) NULL DEFAULT NULL,
  `is_first_purchase` tinyint(1) NULL DEFAULT NULL,
  `return_rate` decimal(4, 3) NULL DEFAULT NULL,
  `customer_satisfaction` int(11) NULL DEFAULT NULL,
  `profit_margin` decimal(4, 2) NULL DEFAULT NULL,
  `has_returned` tinyint(1) NULL DEFAULT NULL,
  `has_complaints` tinyint(1) NULL DEFAULT NULL,
  `recommendation_score` int(11) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `product_id`(`product_id`) USING BTREE,
  INDEX `customer_id`(`customer_id`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE,
  CONSTRAINT `sales_records_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `sales_records_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 10001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
