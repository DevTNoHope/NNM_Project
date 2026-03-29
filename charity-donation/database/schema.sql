CREATE DATABASE IF NOT EXISTS `charity_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `charity_db`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `onchain_claims`;
DROP TABLE IF EXISTS `withdraw_approvals`;
DROP TABLE IF EXISTS `withdraw_requests`;
DROP TABLE IF EXISTS `project_updates`;
DROP TABLE IF EXISTS `project_approvals`;
DROP TABLE IF EXISTS `donations`;
DROP TABLE IF EXISTS `user_badges`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `badges`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `google_sub` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('USER','FOUNDER','ADMIN') COLLATE utf8mb4_unicode_ci DEFAULT 'USER',
  `linked_wallet` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_verified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  UNIQUE KEY `uk_users_google_sub` (`google_sub`),
  UNIQUE KEY `uk_users_linked_wallet` (`linked_wallet`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `badges` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_points` decimal(18,2) NOT NULL,
  `icon_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_badges_name` (`name`),
  UNIQUE KEY `uk_badges_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `projects` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `founder_id` bigint NOT NULL,
  `category_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `goal_amount` decimal(18,2) NOT NULL,
  `status` enum('DRAFT','PENDING','APPROVED','PUBLISHED','REJECTED','ARCHIVED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `cover_image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vault_address` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ipfs_cid` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_projects_founder` (`founder_id`),
  KEY `idx_projects_category` (`category_id`),
  FULLTEXT KEY `ft_project_title_description` (`title`, `description`),
  FULLTEXT KEY `ft_project_title` (`title`),
  CONSTRAINT `fk_projects_founder` FOREIGN KEY (`founder_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_projects_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_badges` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `badge_id` bigint NOT NULL,
  `earned_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_selected` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_badges_user_badge` (`user_id`, `badge_id`),
  KEY `idx_user_badges_user` (`user_id`),
  KEY `idx_user_badges_badge` (`badge_id`),
  CONSTRAINT `fk_user_badges_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_badges_badge` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `donations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `project_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `donor_wallet` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(18,2) NOT NULL,
  `donation_type` enum('CRYPTO','BANKING') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CRYPTO',
  `chain_id` bigint DEFAULT NULL,
  `token_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','FAILED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `vnp_txn_ref` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vnp_transaction_no` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `confirmed_at` datetime DEFAULT NULL,
  `tx_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_donations_tx_hash` (`tx_hash`),
  KEY `idx_donations_project` (`project_id`),
  KEY `idx_donations_user` (`user_id`),
  KEY `idx_donations_vnp_txn_ref` (`vnp_txn_ref`),
  CONSTRAINT `fk_donations_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_donations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `project_approvals` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `project_id` bigint NOT NULL,
  `admin_id` bigint NOT NULL,
  `decision` enum('APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `decided_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project_approvals_project` (`project_id`),
  KEY `idx_project_approvals_admin` (`admin_id`),
  CONSTRAINT `fk_project_approvals_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_approvals_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `project_updates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `project_id` bigint NOT NULL,
  `author_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_updates_project` (`project_id`),
  KEY `idx_updates_author` (`author_id`),
  CONSTRAINT `fk_project_updates_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_updates_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `withdraw_requests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `project_id` bigint NOT NULL,
  `founder_id` bigint NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `status` enum('PENDING_EMAIL','PENDING','APPROVED','REJECTED','CLAIMED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING_EMAIL',
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `type` enum('CRYPTO','BANKING') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CRYPTO',
  `bank_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verification_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_withdraw_project` (`project_id`),
  KEY `idx_withdraw_founder` (`founder_id`),
  CONSTRAINT `fk_withdraw_requests_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_withdraw_requests_founder` FOREIGN KEY (`founder_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `withdraw_approvals` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `withdraw_request_id` bigint NOT NULL,
  `admin_id` bigint NOT NULL,
  `decision` enum('APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_signature` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nonce` bigint DEFAULT NULL,
  `deadline` bigint DEFAULT NULL,
  `decided_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_withdraw_approvals_request` (`withdraw_request_id`),
  KEY `idx_withdraw_approvals_admin` (`admin_id`),
  CONSTRAINT `fk_withdraw_approvals_request` FOREIGN KEY (`withdraw_request_id`) REFERENCES `withdraw_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_withdraw_approvals_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `onchain_claims` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `withdraw_request_id` bigint NOT NULL,
  `claim_tx_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','FAILED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `confirmed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_onchain_claims_claim_tx_hash` (`claim_tx_hash`),
  KEY `idx_onchain_claims_request` (`withdraw_request_id`),
  CONSTRAINT `fk_onchain_claims_request` FOREIGN KEY (`withdraw_request_id`) REFERENCES `withdraw_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `related_id` bigint DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_id` (`user_id`),
  KEY `idx_notifications_created_at` (`created_at` DESC),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
