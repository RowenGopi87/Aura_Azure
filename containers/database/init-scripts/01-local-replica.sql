-- =============================================
-- AURA SDLC DATABASE - LOCAL REPLICA
-- =============================================
-- This file replicates your local database exactly
-- Includes: All table structures + foundational data
-- Excludes: Transactional data (initiatives, features, epics, stories)
-- Generated from local MariaDB database
-- =============================================

-- Use the database
USE aura_playground;

-- Disable foreign key checks during initialization
SET FOREIGN_KEY_CHECKS = 0;

/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.2-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: aura_playground
-- ------------------------------------------------------
-- Server version	11.8.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `audit_config`
--

DROP TABLE IF EXISTS `audit_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_name` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `description` text DEFAULT NULL,
  `updated_by` varchar(36) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_name` (`setting_name`),
  KEY `updated_by` (`updated_by`),
  KEY `idx_setting_name` (`setting_name`),
  CONSTRAINT `audit_config_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `audit_events`
--

DROP TABLE IF EXISTS `audit_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_events` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `session_id` varchar(36) DEFAULT NULL,
  `event_type` enum('generation','edit','save','delete','export','integration','view','search','ai_enhancement') NOT NULL,
  `feature_category` enum('brief','initiative','feature','epic','story','code','design','test','auth','system') NOT NULL,
  `action` varchar(100) NOT NULL,
  `resource_type` varchar(50) DEFAULT NULL,
  `resource_id` varchar(36) DEFAULT NULL,
  `resource_title` varchar(500) DEFAULT NULL,
  `generation_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`generation_data`)),
  `prompt_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`prompt_data`)),
  `ai_model_used` varchar(50) DEFAULT NULL,
  `generation_time_ms` int(11) DEFAULT NULL,
  `before_content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`before_content`)),
  `after_content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`after_content`)),
  `edit_type` enum('minor','major','complete_rewrite') DEFAULT NULL,
  `fields_changed` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fields_changed`)),
  `was_saved` tinyint(1) DEFAULT 0,
  `was_exported` tinyint(1) DEFAULT 0,
  `was_integrated` tinyint(1) DEFAULT 0,
  `integration_target` varchar(50) DEFAULT NULL,
  `page_url` varchar(500) DEFAULT NULL,
  `referrer_url` varchar(500) DEFAULT NULL,
  `browser_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`browser_info`)),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `user_satisfaction_score` int(11) DEFAULT NULL,
  `content_quality_score` decimal(3,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_feature_category` (`feature_category`),
  KEY `idx_action` (`action`),
  KEY `idx_resource_type` (`resource_type`),
  KEY `idx_resource_id` (`resource_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_was_saved` (`was_saved`),
  KEY `idx_was_exported` (`was_exported`),
  KEY `idx_was_integrated` (`was_integrated`),
  KEY `idx_audit_events_comprehensive` (`user_id`,`feature_category`,`event_type`,`created_at`),
  CONSTRAINT `audit_events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aurav2_ai_consolidations`
--

DROP TABLE IF EXISTS `aurav2_ai_consolidations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `aurav2_ai_consolidations` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `business_brief_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `consolidation_type` enum('stage_optimization','requirement_analysis','risk_assessment','estimation_refinement') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `input_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`input_data`)),
  `ai_recommendations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`ai_recommendations`)),
  `confidence_score` decimal(3,2) DEFAULT NULL,
  `human_review_status` enum('pending','approved','rejected','modified') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'pending',
  `human_reviewer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `implementation_status` enum('pending','applied','discarded') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aurav2_business_brief_extensions`
--

DROP TABLE IF EXISTS `aurav2_business_brief_extensions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `aurav2_business_brief_extensions` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `business_brief_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `workflow_type` enum('new_system','enhancement') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `estimation_size` enum('xxs','xs','s','m','l','xl','xxl') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `estimation_confidence` enum('bronze','silver','gold') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `build_or_buy_decision` enum('build','buy','enhance','pending') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'pending',
  `rfi_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rfi_data`)),
  `capacity_planning` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`capacity_planning`)),
  `discovery_findings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`discovery_findings`)),
  `quality_score` decimal(3,2) DEFAULT NULL,
  `ai_analysis` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ai_analysis`)),
  `stakeholder_alignment` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`stakeholder_alignment`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `applied_recommendations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Track applied AI recommendations with timestamps' CHECK (json_valid(`applied_recommendations`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aurav2_qualified_ideas`
--

DROP TABLE IF EXISTS `aurav2_qualified_ideas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `aurav2_qualified_ideas` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `business_brief_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `title` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `qualification_score` decimal(3,2) NOT NULL,
  `market_demand` int(11) DEFAULT 5,
  `technical_feasibility` int(11) DEFAULT 5,
  `business_value` int(11) DEFAULT 5,
  `resource_availability` int(11) DEFAULT 5,
  `strategic_alignment` int(11) DEFAULT 5,
  `risk_level` int(11) DEFAULT 5,
  `complexity` int(11) DEFAULT 5,
  `effort` int(11) DEFAULT 5,
  `market_impact` int(11) DEFAULT 5,
  `priority` int(11) DEFAULT 999,
  `market_research` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `competitor_analysis` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `technical_assessment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `business_case` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `risk_assessment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `recommended_action` enum('proceed','research_more','decline','defer') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `qualified_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `estimated_roi` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `time_to_market` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `resource_requirement` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `portfolio_quarter` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aurav2_user_roles`
--

DROP TABLE IF EXISTS `aurav2_user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `aurav2_user_roles` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `role` enum('product_owner','product_manager','portfolio_manager','delivery_manager','business_owner','art_leadership','initiative_lead') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `department` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aurav2_workflow_progress`
--

DROP TABLE IF EXISTS `aurav2_workflow_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `aurav2_workflow_progress` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `business_brief_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `workflow_type` enum('new_system','enhancement') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `current_stage_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `stage_completion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`stage_completion`)),
  `stage_history` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`stage_history`)),
  `ai_recommendations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ai_recommendations`)),
  `consolidation_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`consolidation_data`)),
  `estimated_completion_date` date DEFAULT NULL,
  `actual_completion_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aurav2_workflow_stages`
--

DROP TABLE IF EXISTS `aurav2_workflow_stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `aurav2_workflow_stages` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `stage_order` int(11) NOT NULL,
  `workflow_type` enum('new_system','enhancement','both') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'both',
  `definition_of_ready` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`definition_of_ready`)),
  `key_players` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`key_players`)),
  `definition_of_done` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`definition_of_done`)),
  `activities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`activities`)),
  `reference_documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`reference_documents`)),
  `ai_consolidation_enabled` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `business_briefs`
--

DROP TABLE IF EXISTS `business_briefs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_briefs` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `business_owner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `lead_business_unit` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `additional_business_units` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `primary_strategic_theme` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `business_objective` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `quantifiable_business_outcomes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `in_scope` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `out_of_scope` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `impact_of_do_nothing` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `happy_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `exceptions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `impacted_end_users` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `change_impact_expected` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `impact_to_other_departments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `other_departments_impacted` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `impacts_existing_technology` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `technology_solutions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `relevant_business_owners` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `other_technology_info` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `supporting_documents` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `submitted_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `status` enum('draft','submitted','in_review','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'draft',
  `priority` enum('low','medium','high','critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'medium',
  `workflow_stage` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `completion_percentage` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `code_items`
--

DROP TABLE IF EXISTS `code_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `code_items` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `work_item_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `work_item_type` enum('feature','epic','story') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `language` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `code` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `parent_department_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `parent_department_id` (`parent_department_id`),
  KEY `idx_department_name` (`name`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`parent_department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `designs`
--

DROP TABLE IF EXISTS `designs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `designs` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `work_item_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `work_item_type` enum('feature','epic','story') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `design_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `file_name` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_by` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  `processed` tinyint(1) DEFAULT 0,
  `processed_at` timestamp NULL DEFAULT NULL,
  `extracted_text` longtext DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `epics`
--

DROP TABLE IF EXISTS `epics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `epics` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `feature_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `business_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `acceptance_criteria` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `priority` enum('low','medium','high','critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'medium',
  `status` enum('backlog','planning','in_progress','done','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'backlog',
  `assigned_to` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `story_points` int(11) DEFAULT NULL,
  `workflow_stage` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `completion_percentage` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `features`
--

DROP TABLE IF EXISTS `features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `features` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `initiative_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `business_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `acceptance_criteria` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `priority` enum('low','medium','high','critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'medium',
  `status` enum('backlog','planning','in_progress','done','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'backlog',
  `assigned_to` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `story_points` int(11) DEFAULT NULL,
  `workflow_stage` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `completion_percentage` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `generation_analytics`
--

DROP TABLE IF EXISTS `generation_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `generation_analytics` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `feature_category` enum('brief','initiative','feature','epic','story','code','design','test') NOT NULL,
  `resource_id` varchar(36) NOT NULL,
  `total_generations` int(11) DEFAULT 0,
  `generations_kept_without_edit` int(11) DEFAULT 0,
  `generations_edited` int(11) DEFAULT 0,
  `generations_deleted` int(11) DEFAULT 0,
  `minor_edits` int(11) DEFAULT 0,
  `major_edits` int(11) DEFAULT 0,
  `complete_rewrites` int(11) DEFAULT 0,
  `ai_enhancements` int(11) DEFAULT 0,
  `saves_count` int(11) DEFAULT 0,
  `exports_count` int(11) DEFAULT 0,
  `integrations_count` int(11) DEFAULT 0,
  `first_generated_at` timestamp NULL DEFAULT NULL,
  `last_modified_at` timestamp NULL DEFAULT NULL,
  `total_time_spent_minutes` int(11) DEFAULT 0,
  `avg_generation_time_ms` int(11) DEFAULT 0,
  `avg_content_quality_score` decimal(3,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_resource` (`user_id`,`feature_category`,`resource_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_feature_category` (`feature_category`),
  KEY `idx_resource_id` (`resource_id`),
  KEY `idx_generation_analytics_reporting` (`feature_category`,`created_at`,`total_generations`),
  CONSTRAINT `generation_analytics_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `initiatives`
--

DROP TABLE IF EXISTS `initiatives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `initiatives` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `business_brief_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `business_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `acceptance_criteria` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `priority` enum('low','medium','high','critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'medium',
  `status` enum('backlog','planning','in_progress','done','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'backlog',
  `assigned_to` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `estimated_value` decimal(10,2) DEFAULT NULL,
  `workflow_stage` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `completion_percentage` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `portfolio_id` varchar(36) DEFAULT NULL,
  KEY `idx_portfolio_id` (`portfolio_id`),
  CONSTRAINT `initiatives_ibfk_1` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `organizational_levels`
--

DROP TABLE IF EXISTS `organizational_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizational_levels` (
  `id` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `hierarchy_order` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_hierarchy_order` (`hierarchy_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permission_types`
--

DROP TABLE IF EXISTS `permission_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission_types` (
  `id` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `portfolios`
--

DROP TABLE IF EXISTS `portfolios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `portfolios` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `function` text DEFAULT NULL,
  `color` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prompt_analytics`
--

DROP TABLE IF EXISTS `prompt_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `prompt_analytics` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `feature_category` enum('brief','initiative','feature','epic','story','code','design','test') NOT NULL,
  `prompt_text` text NOT NULL,
  `keywords` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`keywords`)),
  `prompt_length` int(11) DEFAULT NULL,
  `complexity_score` decimal(3,2) DEFAULT NULL,
  `success_rate` decimal(3,2) DEFAULT NULL,
  `avg_generation_time_ms` int(11) DEFAULT NULL,
  `usage_count` int(11) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_feature_category` (`feature_category`),
  KEY `idx_keywords` (`keywords`(768)),
  KEY `idx_usage_count` (`usage_count`),
  CONSTRAINT `prompt_analytics_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `role_permission_matrix`
--

DROP TABLE IF EXISTS `role_permission_matrix`;
/*!50001 DROP VIEW IF EXISTS `role_permission_matrix`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `role_permission_matrix` AS SELECT
 1 AS `role_id`,
  1 AS `role_name`,
  1 AS `role_display_name`,
  1 AS `organizational_level`,
  1 AS `department`,
  1 AS `module_name`,
  1 AS `module_display_name`,
  1 AS `can_access`,
  1 AS `can_read`,
  1 AS `can_write`,
  1 AS `can_delete`,
  1 AS `can_admin` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` varchar(36) NOT NULL,
  `role_id` varchar(36) NOT NULL,
  `module_id` varchar(36) NOT NULL,
  `permission_type_id` varchar(36) NOT NULL,
  `can_access` tinyint(1) DEFAULT 0,
  `can_read` tinyint(1) DEFAULT 0,
  `can_write` tinyint(1) DEFAULT 0,
  `can_delete` tinyint(1) DEFAULT 0,
  `can_admin` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_module_permission` (`role_id`,`module_id`,`permission_type_id`),
  KEY `module_id` (`module_id`),
  KEY `permission_type_id` (`permission_type_id`),
  KEY `idx_role_permissions` (`role_id`,`module_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `system_modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_3` FOREIGN KEY (`permission_type_id`) REFERENCES `permission_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `organizational_level_id` varchar(36) NOT NULL,
  `department_id` varchar(36) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `department_id` (`department_id`),
  KEY `idx_role_name` (`name`),
  KEY `idx_org_level` (`organizational_level_id`),
  CONSTRAINT `roles_ibfk_1` FOREIGN KEY (`organizational_level_id`) REFERENCES `organizational_levels` (`id`),
  CONSTRAINT `roles_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `safe_mappings`
--

DROP TABLE IF EXISTS `safe_mappings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `safe_mappings` (
  `id` int(11) NOT NULL DEFAULT 0,
  `work_item_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `safe_stage` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stories`
--

DROP TABLE IF EXISTS `stories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `stories` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `epic_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `user_story` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `acceptance_criteria` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `priority` enum('low','medium','high','critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'medium',
  `status` enum('backlog','planning','in_progress','done','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'backlog',
  `assigned_to` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `story_points` int(11) DEFAULT NULL,
  `workflow_stage` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `completion_percentage` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `system_modules`
--

DROP TABLE IF EXISTS `system_modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_modules` (
  `id` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `route_path` varchar(200) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `module_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_module_name` (`name`),
  KEY `idx_module_order` (`module_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `test_cases`
--

DROP TABLE IF EXISTS `test_cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `test_cases` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `work_item_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `work_item_type` enum('feature','epic','story') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `test_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `steps` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `expected_result` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `status` enum('pass','fail','not_run') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'not_run',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `user_permissions`
--

DROP TABLE IF EXISTS `user_permissions`;
/*!50001 DROP VIEW IF EXISTS `user_permissions`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `user_permissions` AS SELECT
 1 AS `user_id`,
  1 AS `user_name`,
  1 AS `email`,
  1 AS `role_name`,
  1 AS `role_display_name`,
  1 AS `module_name`,
  1 AS `module_display_name`,
  1 AS `route_path`,
  1 AS `can_access`,
  1 AS `can_read`,
  1 AS `can_write`,
  1 AS `can_delete`,
  1 AS `can_admin` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `user_role_assignments`
--

DROP TABLE IF EXISTS `user_role_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role_assignments` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `role_id` varchar(36) NOT NULL,
  `assigned_by` varchar(36) DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_role` (`user_id`,`role_id`),
  KEY `assigned_by` (`assigned_by`),
  KEY `idx_user_roles` (`user_id`),
  KEY `idx_role_users` (`role_id`),
  CONSTRAINT `user_role_assignments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_role_assignments_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_role_assignments_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `login_time` timestamp NULL DEFAULT current_timestamp(),
  `last_activity` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `logout_time` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_token` (`session_token`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_token` (`session_token`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `entra_id` varchar(36) NOT NULL,
  `user_principal_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `given_name` varchar(100) DEFAULT NULL,
  `surname` varchar(100) DEFAULT NULL,
  `job_title` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `office_location` varchar(100) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `business_phones` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`business_phones`)),
  `manager_email` varchar(255) DEFAULT NULL,
  `direct_reports` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`direct_reports`)),
  `roles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`roles`)),
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `login_count` int(11) DEFAULT 0,
  `created_datetime` timestamp NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `department_id` varchar(36) DEFAULT NULL,
  `primary_role_id` varchar(36) DEFAULT NULL,
  `organizational_level_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `entra_id` (`entra_id`),
  UNIQUE KEY `user_principal_name` (`user_principal_name`),
  UNIQUE KEY `employee_id` (`employee_id`),
  KEY `idx_entra_id` (`entra_id`),
  KEY `idx_email` (`email`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_department` (`department`),
  KEY `idx_is_active` (`is_active`),
  KEY `department_id` (`department_id`),
  KEY `primary_role_id` (`primary_role_id`),
  KEY `organizational_level_id` (`organizational_level_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`primary_role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_3` FOREIGN KEY (`organizational_level_id`) REFERENCES `organizational_levels` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_4` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_5` FOREIGN KEY (`primary_role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_6` FOREIGN KEY (`organizational_level_id`) REFERENCES `organizational_levels` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vector_stores`
--

DROP TABLE IF EXISTS `vector_stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `vector_stores` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(255) NOT NULL,
  `database_name` varchar(255) NOT NULL,
  `embedding_provider` varchar(50) DEFAULT NULL,
  `embedding_model` varchar(100) DEFAULT NULL,
  `embedding_dimension` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `document_count` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`),
  KEY `idx_database_name` (`database_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `work_items_context`
--

DROP TABLE IF EXISTS `work_items_context`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_items_context` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `document` text NOT NULL,
  `embedding` vector(1536) NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'aura_playground'
--
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetDashboardStats` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
DELIMITER ;;
CREATE DEFINER=`aura_user`@`localhost` PROCEDURE `GetDashboardStats`()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM business_briefs WHERE status = 'approved') as approved_briefs,
        (SELECT COUNT(*) FROM initiatives WHERE status IN ('planning', 'in_progress')) as active_initiatives,
        (SELECT COUNT(*) FROM features WHERE status IN ('planning', 'in_progress')) as active_features,
        (SELECT COUNT(*) FROM stories WHERE status IN ('planning', 'in_progress')) as active_stories,
        (SELECT COUNT(*) FROM test_cases WHERE status IN ('ready', 'executing')) as pending_tests,
        (SELECT COUNT(*) FROM test_cases WHERE status = 'passed') as passed_tests,
        (SELECT COUNT(*) FROM test_cases WHERE status = 'failed') as failed_tests,
        (SELECT COUNT(*) FROM documents WHERE processed = true) as processed_documents;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetTestCasesWithContext` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
DELIMITER ;;
CREATE DEFINER=`aura_user`@`localhost` PROCEDURE `GetTestCasesWithContext`(
    IN story_id_param VARCHAR(36)
)
BEGIN
    SELECT 
        tc.*,
        s.title as story_title,
        e.title as epic_title,
        f.title as feature_title,
        i.title as initiative_title,
        bb.title as business_brief_title
    FROM test_cases tc
    JOIN stories s ON tc.story_id = s.id
    JOIN epics e ON s.epic_id = e.id
    JOIN features f ON e.feature_id = f.id
    JOIN initiatives i ON f.initiative_id = i.id
    JOIN business_briefs bb ON i.business_brief_id = bb.id
    WHERE tc.story_id = story_id_param OR story_id_param IS NULL
    ORDER BY tc.created_at DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetWorkItemHierarchy` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
DELIMITER ;;
CREATE DEFINER=`aura_user`@`localhost` PROCEDURE `GetWorkItemHierarchy`(
    IN work_item_id VARCHAR(36),
    IN work_item_type ENUM('business_brief', 'initiative', 'feature', 'epic', 'story')
)
BEGIN
    CASE work_item_type
        WHEN 'business_brief' THEN
            SELECT 
                bb.id as business_brief_id, bb.title as business_brief_title,
                i.id as initiative_id, i.title as initiative_title,
                f.id as feature_id, f.title as feature_title,
                e.id as epic_id, e.title as epic_title,
                s.id as story_id, s.title as story_title
            FROM business_briefs bb
            LEFT JOIN initiatives i ON bb.id = i.business_brief_id
            LEFT JOIN features f ON i.id = f.initiative_id
            LEFT JOIN epics e ON f.id = e.feature_id
            LEFT JOIN stories s ON e.id = s.epic_id
            WHERE bb.id = work_item_id;
            
        WHEN 'story' THEN
            SELECT 
                bb.id as business_brief_id, bb.title as business_brief_title,
                i.id as initiative_id, i.title as initiative_title,
                f.id as feature_id, f.title as feature_title,
                e.id as epic_id, e.title as epic_title,
                s.id as story_id, s.title as story_title
            FROM stories s
            JOIN epics e ON s.epic_id = e.id
            JOIN features f ON e.feature_id = f.id
            JOIN initiatives i ON f.initiative_id = i.id
            JOIN business_briefs bb ON i.business_brief_id = bb.id
            WHERE s.id = work_item_id;
            
        
        ELSE
            SELECT 'Invalid work item type' as error;
    END CASE;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetWorkItemsByStatus` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
DELIMITER ;;
CREATE DEFINER=`aura_user`@`localhost` PROCEDURE `GetWorkItemsByStatus`(
    IN item_status VARCHAR(50)
)
BEGIN
    SELECT 'business_brief' as type, id, title, status, priority, completion_percentage, created_at, updated_at
    FROM business_briefs WHERE status = item_status
    
    UNION ALL
    
    SELECT 'initiative' as type, id, title, status, priority, completion_percentage, created_at, updated_at
    FROM initiatives WHERE status = item_status
    
    UNION ALL
    
    SELECT 'feature' as type, id, title, status, priority, completion_percentage, created_at, updated_at
    FROM features WHERE status = item_status
    
    UNION ALL
    
    SELECT 'epic' as type, id, title, status, priority, completion_percentage, created_at, updated_at
    FROM epics WHERE status = item_status
    
    UNION ALL
    
    SELECT 'story' as type, id, title, status, priority, completion_percentage, created_at, updated_at
    FROM stories WHERE status = item_status
    
    ORDER BY updated_at DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `SearchWorkItems` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
DELIMITER ;;
CREATE DEFINER=`aura_user`@`localhost` PROCEDURE `SearchWorkItems`(
    IN search_text VARCHAR(255)
)
BEGIN
    SELECT 'business_brief' as type, id, title, description, status, priority, created_at
    FROM business_briefs 
    WHERE title LIKE CONCAT('%', search_text, '%') OR description LIKE CONCAT('%', search_text, '%')
    
    UNION ALL
    
    SELECT 'initiative' as type, id, title, description, status, priority, created_at
    FROM initiatives 
    WHERE title LIKE CONCAT('%', search_text, '%') OR description LIKE CONCAT('%', search_text, '%')
    
    UNION ALL
    
    SELECT 'feature' as type, id, title, description, status, priority, created_at
    FROM features 
    WHERE title LIKE CONCAT('%', search_text, '%') OR description LIKE CONCAT('%', search_text, '%')
    
    UNION ALL
    
    SELECT 'epic' as type, id, title, description, status, priority, created_at
    FROM epics 
    WHERE title LIKE CONCAT('%', search_text, '%') OR description LIKE CONCAT('%', search_text, '%')
    
    UNION ALL
    
    SELECT 'story' as type, id, title, description, status, priority, created_at
    FROM stories 
    WHERE title LIKE CONCAT('%', search_text, '%') OR description LIKE CONCAT('%', search_text, '%')
    
    ORDER BY created_at DESC
    LIMIT 50;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `UpdateWorkItemProgress` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
DELIMITER ;;
CREATE DEFINER=`aura_user`@`localhost` PROCEDURE `UpdateWorkItemProgress`(
    IN work_item_id VARCHAR(36),
    IN work_item_type ENUM('business_brief', 'initiative', 'feature', 'epic', 'story'),
    IN new_status VARCHAR(50),
    IN completion_percentage DECIMAL(5,2)
)
BEGIN
    CASE work_item_type
        WHEN 'business_brief' THEN
            UPDATE business_briefs 
            SET status = new_status, completion_percentage = completion_percentage, updated_at = NOW()
            WHERE id = work_item_id;
            
        WHEN 'initiative' THEN
            UPDATE initiatives 
            SET status = new_status, completion_percentage = completion_percentage, updated_at = NOW()
            WHERE id = work_item_id;
            
        WHEN 'feature' THEN
            UPDATE features 
            SET status = new_status, completion_percentage = completion_percentage, updated_at = NOW()
            WHERE id = work_item_id;
            
        WHEN 'epic' THEN
            UPDATE epics 
            SET status = new_status, completion_percentage = completion_percentage, updated_at = NOW()
            WHERE id = work_item_id;
            
        WHEN 'story' THEN
            UPDATE stories 
            SET status = new_status, completion_percentage = completion_percentage, updated_at = NOW()
            WHERE id = work_item_id;
    END CASE;
    
    SELECT ROW_COUNT() as affected_rows;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `role_permission_matrix`
--

/*!50001 DROP VIEW IF EXISTS `role_permission_matrix`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`aura_user`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `role_permission_matrix` AS select `r`.`id` AS `role_id`,`r`.`name` AS `role_name`,`r`.`display_name` AS `role_display_name`,`ol`.`name` AS `organizational_level`,`d`.`name` AS `department`,`sm`.`name` AS `module_name`,`sm`.`display_name` AS `module_display_name`,`rp`.`can_access` AS `can_access`,`rp`.`can_read` AS `can_read`,`rp`.`can_write` AS `can_write`,`rp`.`can_delete` AS `can_delete`,`rp`.`can_admin` AS `can_admin` from ((((`roles` `r` left join `organizational_levels` `ol` on(`r`.`organizational_level_id` = `ol`.`id`)) left join `departments` `d` on(`r`.`department_id` = `d`.`id`)) left join `role_permissions` `rp` on(`r`.`id` = `rp`.`role_id`)) left join `system_modules` `sm` on(`rp`.`module_id` = `sm`.`id`)) order by `ol`.`hierarchy_order`,`r`.`display_name`,`sm`.`module_order` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `user_permissions`
--

/*!50001 DROP VIEW IF EXISTS `user_permissions`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`aura_user`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `user_permissions` AS select `u`.`id` AS `user_id`,`u`.`display_name` AS `user_name`,`u`.`email` AS `email`,`r`.`name` AS `role_name`,`r`.`display_name` AS `role_display_name`,`sm`.`name` AS `module_name`,`sm`.`display_name` AS `module_display_name`,`sm`.`route_path` AS `route_path`,`rp`.`can_access` AS `can_access`,`rp`.`can_read` AS `can_read`,`rp`.`can_write` AS `can_write`,`rp`.`can_delete` AS `can_delete`,`rp`.`can_admin` AS `can_admin` from ((((`users` `u` join `user_role_assignments` `ura` on(`u`.`id` = `ura`.`user_id` and `ura`.`is_active` = 1)) join `roles` `r` on(`ura`.`role_id` = `r`.`id`)) join `role_permissions` `rp` on(`r`.`id` = `rp`.`role_id`)) join `system_modules` `sm` on(`rp`.`module_id` = `sm`.`id`)) where `u`.`is_active` = 1 and `r`.`is_active` = 1 and `sm`.`is_active` = 1 order by `u`.`display_name`,`sm`.`module_order` */;
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
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-09-22 20:53:18
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.2-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: aura_playground
-- ------------------------------------------------------
-- Server version	11.8.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Dumping data for table `portfolios`
--

LOCK TABLES `portfolios` WRITE;
/*!40000 ALTER TABLE `portfolios` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `portfolios` (`id`, `name`, `description`, `function`, `color`, `created_at`, `updated_at`) VALUES ('customer-experience','Customer Experience','Customer-facing features and improvements','Customer Experience','#10B981','2025-09-22 09:00:17','2025-09-22 09:00:17'),
('default-portfolio','Default Portfolio','Default portfolio for initial setup','General Development','#3B82F6','2025-09-22 09:00:17','2025-09-22 09:00:17'),
('PORTFOLIO-COMMERCIAL','Commercial Portfolio','Agent systems and commercial booking platforms','Handles commercial booking systems, agent platforms like ResConnect, and B2B customer solutions for travel agents and corporate clients','#F59E0B','2025-08-23 05:56:07','2025-08-23 05:56:07'),
('PORTFOLIO-CUSTOMER','Customer Portfolio','Customer experience and engagement solutions','Manages customer-specific projects and specialized customer websites like rugby sevens, events, and customer portal solutions','#10B981','2025-08-23 05:56:07','2025-08-23 05:56:07'),
('PORTFOLIO-DONATA','dnata Portfolio','Ground operations and baggage handling systems','Handles below-the-wing airline operations including ground operations, baggage handling, cargo management, and airport operational systems','#3B82F6','2025-08-23 05:56:07','2025-09-20 07:21:54'),
('PORTFOLIO-GROUP-SERVICE','Group Service Portfolio','Internal systems and payment infrastructure','Manages internal operations including payroll systems, HR processes, hiring platforms, and payment gateway infrastructure for web and mobile frontends','#8B5CF6','2025-08-23 05:56:07','2025-08-23 05:56:07'),
('PORTFOLIO-WEB-MOBILE','Web & Mobile','Customer-facing web and mobile applications development','Develops and maintains customer-facing digital touchpoints including websites, mobile apps, and progressive web applications','#06B6D4','2025-08-23 05:56:07','2025-09-20 07:22:21');
/*!40000 ALTER TABLE `portfolios` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `users` (`id`, `entra_id`, `user_principal_name`, `email`, `display_name`, `given_name`, `surname`, `job_title`, `department`, `office_location`, `employee_id`, `business_phones`, `manager_email`, `direct_reports`, `roles`, `is_active`, `last_login`, `login_count`, `created_datetime`, `created_at`, `updated_at`, `department_id`, `primary_role_id`, `organizational_level_id`) VALUES ('c09ee620-95b4-11f0-b1e6-60ff9e34b8d1','55555555-5555-5555-5555-555555555555','rowen.gopi@emirates.com','rowen.gopi@emirates.com','Rowen Gopi','Rowen','Gopi','System Administrator','IT Operations','Dubai HQ','EK001005','[\"+971 4 214 4450\"]',NULL,NULL,'[\"system_administrator\"]',1,NULL,0,'2025-09-20 03:56:27','2025-09-20 03:56:27','2025-09-20 03:56:27','bb7eaa50-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8363-95b4-11f0-b1e6-60ff9e34b8d1','bb7e788d-95b4-11f0-b1e6-60ff9e34b8d1'),
('c5a8c77d-95b4-11f0-b1e6-60ff9e34b8d1','66666666-6666-6666-6666-666666666666','ahmad.hassan@emirates.com','ahmad.hassan@emirates.com','Ahmad Hassan','Ahmad','Hassan','Senior Quality Engineer','Quality Engineering','Dubai HQ','EK001006','[\"+971 4 214 4451\"]',NULL,NULL,NULL,1,NULL,0,'2025-09-20 03:56:35','2025-09-20 03:56:35','2025-09-20 03:56:35','bb7ea55b-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8246-95b4-11f0-b1e6-60ff9e34b8d1','bb7e7b90-95b4-11f0-b1e6-60ff9e34b8d1'),
('c5a8c998-95b4-11f0-b1e6-60ff9e34b8d1','77777777-7777-7777-7777-777777777777','layla.omar@emirates.com','layla.omar@emirates.com','Layla Omar','Layla','Omar','Software Developer','Software Engineering','Dubai HQ','EK001007','[\"+971 4 214 4452\"]',NULL,NULL,NULL,1,NULL,0,'2025-09-20 03:56:35','2025-09-20 03:56:35','2025-09-20 03:56:35','bb7ea9a8-95b4-11f0-b1e6-60ff9e34b8d1','bb7f82d6-95b4-11f0-b1e6-60ff9e34b8d1','bb7e7b90-95b4-11f0-b1e6-60ff9e34b8d1'),
('c5a8ca55-95b4-11f0-b1e6-60ff9e34b8d1','88888888-8888-8888-8888-888888888888','khalid.ali@emirates.com','khalid.ali@emirates.com','Khalid Ali','Khalid','Ali','Technical Product Owner','Product and Delivery','Dubai HQ','EK001008','[\"+971 4 214 4453\"]',NULL,NULL,NULL,1,NULL,0,'2025-09-20 03:56:35','2025-09-20 03:56:35','2025-09-20 03:56:35','bb7ea786-95b4-11f0-b1e6-60ff9e34b8d1','bb7f831a-95b4-11f0-b1e6-60ff9e34b8d1','bb7e7b90-95b4-11f0-b1e6-60ff9e34b8d1'),
('e814ff13-95b5-11f0-b1e6-60ff9e34b8d1','11111111-1111-1111-1111-111111111111','sarah.ahmed@emirates.com','sarah.ahmed@emirates.com','Sarah Ahmed','Sarah','Ahmed','Technical Product Manager','Product and Delivery','Dubai HQ','EK001001','[\"+971 4 214 4444\"]','manager@emirates.com',NULL,'[\"technical_product_manager\"]',1,NULL,0,'2025-09-20 04:04:42','2025-09-20 04:04:42','2025-09-20 04:04:42','bb7ea786-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8169-95b4-11f0-b1e6-60ff9e34b8d1','bb7e7b61-95b4-11f0-b1e6-60ff9e34b8d1'),
('e8150390-95b5-11f0-b1e6-60ff9e34b8d1','22222222-2222-2222-2222-222222222222','mohammed.hassan@emirates.com','mohammed.hassan@emirates.com','Mohammed Hassan','Mohammed','Hassan','Manager of Product and Delivery','Product and Delivery','Dubai HQ','EK001002','[\"+971 4 214 4445\"]','director@emirates.com',NULL,'[\"manager_product_delivery\"]',1,NULL,0,'2025-09-20 04:04:42','2025-09-20 04:04:42','2025-09-20 04:04:42','bb7ea786-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7ec6-95b4-11f0-b1e6-60ff9e34b8d1','bb7e7aae-95b4-11f0-b1e6-60ff9e34b8d1'),
('e815054b-95b5-11f0-b1e6-60ff9e34b8d1','33333333-3333-3333-3333-333333333333','fatima.ali@emirates.com','fatima.ali@emirates.com','Fatima Ali','Fatima','Ali','Principal Software Engineer','Software Engineering','Dubai HQ','EK001003','[\"+971 4 214 4446\"]','manager@emirates.com',NULL,'[\"principal_software_engineer\"]',1,NULL,0,'2025-09-20 04:04:42','2025-09-20 04:04:42','2025-09-20 04:04:42','bb7ea9a8-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8201-95b4-11f0-b1e6-60ff9e34b8d1','bb7e7b61-95b4-11f0-b1e6-60ff9e34b8d1'),
('e8150881-95b5-11f0-b1e6-60ff9e34b8d1','44444444-4444-4444-4444-444444444444','admin@emirates.com','admin@emirates.com','System Administrator','System','Administrator','System Administrator','IT Operations','Dubai HQ','EK001000','[\"+971 4 214 4440\"]',NULL,NULL,'[\"system_administrator\"]',1,NULL,0,'2025-09-20 04:04:42','2025-09-20 04:04:42','2025-09-20 04:04:42','bb7eaa50-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8363-95b4-11f0-b1e6-60ff9e34b8d1','bb7e788d-95b4-11f0-b1e6-60ff9e34b8d1');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `roles` (`id`, `name`, `display_name`, `description`, `organizational_level_id`, `department_id`, `is_active`, `created_at`, `updated_at`) VALUES ('bb7f7b08-95b4-11f0-b1e6-60ff9e34b8d1','evp','Executive Vice President','Executive Vice President with full system access','bb7e788d-95b4-11f0-b1e6-60ff9e34b8d1',NULL,1,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7f7d5b-95b4-11f0-b1e6-60ff9e34b8d1','svp','Senior Vice President','Senior Vice President with full system access','bb7e788d-95b4-11f0-b1e6-60ff9e34b8d1',NULL,1,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7f7dfd-95b4-11f0-b1e6-60ff9e34b8d1','vp','Vice President','Vice President with full system access','bb7e788d-95b4-11f0-b1e6-60ff9e34b8d1',NULL,1,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7f7e49-95b4-11f0-b1e6-60ff9e34b8d1','manager_quality_engineering','Manager of Quality Engineering','Portfolio level quality engineering manager','bb7e7aae-95b4-11f0-b1e6-60ff9e34b8d1','bb7ea55b-95b4-11f0-b1e6-60ff9e34b8d1',1,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7f7ec6-95b4-11f0-b1e6-60ff9e34b8d1','manager_product_delivery','Manager of Product and Delivery','Portfolio level product and delivery manager','bb7e7aae-95b4-11f0-b1e6-60ff9e34b8d1','bb7ea786-95b4-11f0-b1e6-60ff9e34b8d1',1,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7f7f25-95b4-11f0-b1e6-60ff9e34b8d1','manager_software_engineering','Manager of Software Engineering','Portfolio level software engineering manager','bb7e7aae-95b4-11f0-b1e6-60ff9e34b8d1','bb7ea9a8-95b4-11f0-b1e6-60ff9e34b8d1',1,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7f7f6a-95b4-11f0-b1e6-60ff9e34b8d1','manager_product_engineering','Manager of Product Engineering','Portfolio level product engineering manager','bb7e7aae-95b4-11f0-b1e6-60ff9e34b8d1','bb7ea9ea-95b4-11f0-b1e6-60ff9e34b8d1',1,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7f7fa9-95b4-11f0-b1e6-60ff9e34b8d1','manager_software_architecture','Manager of Software Architecture','Portfolio level software architecture manager','bb7e7aae-95b4-11f0-b1e6-60ff9e34b8d1','bb7eaa20-95b4-11f0-b1e6-60ff9e34b8d1',1,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7f810c-95b4-11f0-b1e6-60ff9e34b8d1','principal_qa_engineer','Principal Quality Assurance Engineer','ART level principal QA engineer','bb7e7b61-95b4-11f0-b1e6-60ff9e34b8d1','bb7ea55b-95b4-11f0-b1e6-60ff9e34b8d1',1,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7f8169-95b4-11f0-b1e6-60ff9e34b8d1','technical_product_manager','Technical Product Manager','ART level technical product manager','bb7e7b61-95b4-11f0-b1e6-60ff9e34b8d1','bb7ea786-95b4-11f0-b1e6-60ff9e34b8d1',1,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7f81b4-95b4-11f0-b1e6-60ff9e34b8d1','release_train_lead','Release Train Lead','ART level release train lead','bb7e7b61-95b4-11f0-b1e6-60ff9e34b8d1','bb7ea786-95b4-11f0-b1e6-60ff9e34b8d1',1,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7f8201-95b4-11f0-b1e6-60ff9e34b8d1','principal_software_engineer','Principal Software Engineer','ART level principal software engineer','bb7e7b61-95b4-11f0-b1e6-60ff9e34b8d1','bb7ea9a8-95b4-11f0-b1e6-60ff9e34b8d1',1,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7f8246-95b4-11f0-b1e6-60ff9e34b8d1','senior_quality_engineer','Senior Quality Engineer','Team level senior quality engineer','bb7e7b90-95b4-11f0-b1e6-60ff9e34b8d1','bb7ea55b-95b4-11f0-b1e6-60ff9e34b8d1',1,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7f8293-95b4-11f0-b1e6-60ff9e34b8d1','lead_quality_engineer','Lead Quality Engineer','Team level lead quality engineer','bb7e7b90-95b4-11f0-b1e6-60ff9e34b8d1','bb7ea55b-95b4-11f0-b1e6-60ff9e34b8d1',1,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7f82d6-95b4-11f0-b1e6-60ff9e34b8d1','software_developer','Software Developer','Team level software developer','bb7e7b90-95b4-11f0-b1e6-60ff9e34b8d1','bb7ea9a8-95b4-11f0-b1e6-60ff9e34b8d1',1,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7f831a-95b4-11f0-b1e6-60ff9e34b8d1','technical_product_owner','Technical Product Owner','Team level technical product owner','bb7e7b90-95b4-11f0-b1e6-60ff9e34b8d1','bb7ea786-95b4-11f0-b1e6-60ff9e34b8d1',1,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7f8363-95b4-11f0-b1e6-60ff9e34b8d1','system_administrator','System Administrator','Full system administrator access','bb7e788d-95b4-11f0-b1e6-60ff9e34b8d1','bb7eaa50-95b4-11f0-b1e6-60ff9e34b8d1',1,'2025-09-20 03:56:18','2025-09-20 03:56:18');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `departments` (`id`, `name`, `description`, `parent_department_id`, `created_at`, `updated_at`) VALUES ('bb7ea55b-95b4-11f0-b1e6-60ff9e34b8d1','Quality Engineering','Quality assurance and testing',NULL,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7ea786-95b4-11f0-b1e6-60ff9e34b8d1','Product and Delivery','Product management and delivery',NULL,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7ea9a8-95b4-11f0-b1e6-60ff9e34b8d1','Software Engineering','Software development and architecture',NULL,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7ea9ea-95b4-11f0-b1e6-60ff9e34b8d1','Product Engineering','Product engineering and innovation',NULL,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7eaa20-95b4-11f0-b1e6-60ff9e34b8d1','Software Architecture','Software architecture and design',NULL,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7eaa50-95b4-11f0-b1e6-60ff9e34b8d1','IT Operations','IT operations and administration',NULL,'2025-09-20 03:56:18','2025-09-20 03:56:18'),
('bb7eaa7e-95b4-11f0-b1e6-60ff9e34b8d1','Digital Transformation','Digital transformation initiatives',NULL,'2025-09-20 03:56:18','2025-09-20 03:56:18');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping data for table `user_role_assignments`
--

LOCK TABLES `user_role_assignments` WRITE;
/*!40000 ALTER TABLE `user_role_assignments` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `user_role_assignments` (`id`, `user_id`, `role_id`, `assigned_by`, `assigned_at`, `expires_at`, `is_active`, `created_at`) VALUES ('c5a895a0-95b4-11f0-b1e6-60ff9e34b8d1','c09ee620-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8363-95b4-11f0-b1e6-60ff9e34b8d1','c09ee620-95b4-11f0-b1e6-60ff9e34b8d1','2025-09-20 03:56:35',NULL,1,'2025-09-20 03:56:35'),
('c5a8ea46-95b4-11f0-b1e6-60ff9e34b8d1','c5a8c77d-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8246-95b4-11f0-b1e6-60ff9e34b8d1','c09ee620-95b4-11f0-b1e6-60ff9e34b8d1','2025-09-20 03:56:35',NULL,1,'2025-09-20 03:56:35'),
('c5a8ebb4-95b4-11f0-b1e6-60ff9e34b8d1','c5a8c998-95b4-11f0-b1e6-60ff9e34b8d1','bb7f82d6-95b4-11f0-b1e6-60ff9e34b8d1','c09ee620-95b4-11f0-b1e6-60ff9e34b8d1','2025-09-20 03:56:35',NULL,1,'2025-09-20 03:56:35'),
('c5a8ec2d-95b4-11f0-b1e6-60ff9e34b8d1','c5a8ca55-95b4-11f0-b1e6-60ff9e34b8d1','bb7f831a-95b4-11f0-b1e6-60ff9e34b8d1','c09ee620-95b4-11f0-b1e6-60ff9e34b8d1','2025-09-20 03:56:35',NULL,1,'2025-09-20 03:56:35'),
('e815329e-95b5-11f0-b1e6-60ff9e34b8d1','e814ff13-95b5-11f0-b1e6-60ff9e34b8d1','bb7f8169-95b4-11f0-b1e6-60ff9e34b8d1','c09ee620-95b4-11f0-b1e6-60ff9e34b8d1','2025-09-20 04:04:42',NULL,1,'2025-09-20 04:04:42'),
('e81534e6-95b5-11f0-b1e6-60ff9e34b8d1','e8150390-95b5-11f0-b1e6-60ff9e34b8d1','bb7f7ec6-95b4-11f0-b1e6-60ff9e34b8d1','c09ee620-95b4-11f0-b1e6-60ff9e34b8d1','2025-09-20 04:04:42',NULL,1,'2025-09-20 04:04:42'),
('e8153590-95b5-11f0-b1e6-60ff9e34b8d1','e815054b-95b5-11f0-b1e6-60ff9e34b8d1','bb7f8201-95b4-11f0-b1e6-60ff9e34b8d1','c09ee620-95b4-11f0-b1e6-60ff9e34b8d1','2025-09-20 04:04:42',NULL,1,'2025-09-20 04:04:42'),
('e815376e-95b5-11f0-b1e6-60ff9e34b8d1','e8150881-95b5-11f0-b1e6-60ff9e34b8d1','bb7f8363-95b4-11f0-b1e6-60ff9e34b8d1','c09ee620-95b4-11f0-b1e6-60ff9e34b8d1','2025-09-20 04:04:42',NULL,1,'2025-09-20 04:04:42');
/*!40000 ALTER TABLE `user_role_assignments` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `role_permissions` (`id`, `role_id`, `module_id`, `permission_type_id`, `can_access`, `can_read`, `can_write`, `can_delete`, `can_admin`, `created_at`, `updated_at`) VALUES ('bde281b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7b08-95b4-11f0-b1e6-60ff9e34b8d1','bb7eceae-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde298f4-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7b08-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed081-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde2acda-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7b08-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed147-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde2bed6-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7b08-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed17d-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde2d27b-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7b08-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde2e4fe-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7b08-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1e3-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde2f64e-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7b08-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed225-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde30d78-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7b08-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed250-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde32167-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7b08-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed288-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde33531-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7d5b-95b4-11f0-b1e6-60ff9e34b8d1','bb7eceae-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde34c0f-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7d5b-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed081-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde35ee0-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7d5b-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed147-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde370bf-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7d5b-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed17d-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde3811b-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7d5b-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde39202-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7d5b-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1e3-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde3a5c7-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7d5b-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed225-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde3b8a7-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7d5b-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed250-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde3ca8c-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7d5b-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed288-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde3de60-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7dfd-95b4-11f0-b1e6-60ff9e34b8d1','bb7eceae-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde3f3d6-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7dfd-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed081-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde40810-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7dfd-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed147-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde422f4-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7dfd-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed17d-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde44507-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7dfd-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde4592d-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7dfd-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1e3-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde46a83-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7dfd-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed225-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde4838e-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7dfd-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed250-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde497bc-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7dfd-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed288-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde4adbc-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7e49-95b4-11f0-b1e6-60ff9e34b8d1','bb7eceae-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde4c68d-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7e49-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed081-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde4dd36-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7e49-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed147-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde4f44f-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7e49-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed17d-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde50e12-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7e49-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde52059-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7e49-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1e3-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde5334f-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7e49-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed225-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde54650-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7e49-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed250-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde5564e-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7e49-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed288-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde566e8-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7ec6-95b4-11f0-b1e6-60ff9e34b8d1','bb7eceae-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde57b96-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7ec6-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed081-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde59391-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7ec6-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed147-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde5a821-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7ec6-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed17d-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde5bc00-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7ec6-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde5d07c-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7ec6-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1e3-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde5e2e2-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7ec6-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed225-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde5f2ad-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7ec6-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed250-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde6024d-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7ec6-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed288-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde614aa-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7f25-95b4-11f0-b1e6-60ff9e34b8d1','bb7eceae-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde62630-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7f25-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed081-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde63652-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7f25-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed147-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde647e9-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7f25-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed17d-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde65e6d-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7f25-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde674d6-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7f25-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1e3-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde6874b-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7f25-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed225-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde69b41-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7f25-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed250-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde6b31f-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7f25-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed288-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde6c6fb-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7f6a-95b4-11f0-b1e6-60ff9e34b8d1','bb7eceae-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde6d84a-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7f6a-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed081-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde6eb0e-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7f6a-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed147-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde6fd3c-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7f6a-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed17d-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde70d98-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7f6a-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde71f9b-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7f6a-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1e3-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde73086-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7f6a-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed225-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde7526f-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7f6a-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed250-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde76694-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7f6a-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed288-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde77b4e-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7fa9-95b4-11f0-b1e6-60ff9e34b8d1','bb7eceae-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde795c6-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7fa9-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed081-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde7aa19-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7fa9-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed147-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde7bcbf-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7fa9-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed17d-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde7d1e1-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7fa9-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde7e219-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7fa9-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1e3-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde7f35c-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7fa9-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed225-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde80512-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7fa9-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed250-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde81b4b-95b4-11f0-b1e6-60ff9e34b8d1','bb7f7fa9-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed288-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde83213-95b4-11f0-b1e6-60ff9e34b8d1','bb7f810c-95b4-11f0-b1e6-60ff9e34b8d1','bb7eceae-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde85196-95b4-11f0-b1e6-60ff9e34b8d1','bb7f810c-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed081-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde86489-95b4-11f0-b1e6-60ff9e34b8d1','bb7f810c-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed147-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde87b30-95b4-11f0-b1e6-60ff9e34b8d1','bb7f810c-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed17d-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde88e92-95b4-11f0-b1e6-60ff9e34b8d1','bb7f810c-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde8a10f-95b4-11f0-b1e6-60ff9e34b8d1','bb7f810c-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1e3-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde8b1d7-95b4-11f0-b1e6-60ff9e34b8d1','bb7f810c-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed225-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde8c1f5-95b4-11f0-b1e6-60ff9e34b8d1','bb7f810c-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed250-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde8d37d-95b4-11f0-b1e6-60ff9e34b8d1','bb7f810c-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed288-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde8e470-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8169-95b4-11f0-b1e6-60ff9e34b8d1','bb7eceae-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde8f8b9-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8169-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed081-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde90f91-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8169-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed147-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde923ec-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8169-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed17d-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde950d6-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8169-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde96378-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8169-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1e3-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde9777c-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8169-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed225-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde98a75-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8169-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed250-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde99d6a-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8169-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed288-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde9ae55-95b4-11f0-b1e6-60ff9e34b8d1','bb7f81b4-95b4-11f0-b1e6-60ff9e34b8d1','bb7eceae-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde9bfa5-95b4-11f0-b1e6-60ff9e34b8d1','bb7f81b4-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed081-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde9d76c-95b4-11f0-b1e6-60ff9e34b8d1','bb7f81b4-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed147-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bde9ef5f-95b4-11f0-b1e6-60ff9e34b8d1','bb7f81b4-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed17d-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdea0704-95b4-11f0-b1e6-60ff9e34b8d1','bb7f81b4-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdea1b14-95b4-11f0-b1e6-60ff9e34b8d1','bb7f81b4-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1e3-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdea2e5e-95b4-11f0-b1e6-60ff9e34b8d1','bb7f81b4-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed225-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdea3f77-95b4-11f0-b1e6-60ff9e34b8d1','bb7f81b4-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed250-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdea5032-95b4-11f0-b1e6-60ff9e34b8d1','bb7f81b4-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed288-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdea62d5-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8201-95b4-11f0-b1e6-60ff9e34b8d1','bb7eceae-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdea7968-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8201-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed081-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdea8e82-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8201-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed147-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdeaa5d6-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8201-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed17d-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdeabb26-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8201-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdeacf7f-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8201-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1e3-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdeae5e1-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8201-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed225-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdeb0fc5-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8201-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed250-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdeb2279-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8201-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed288-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdeb33b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8246-95b4-11f0-b1e6-60ff9e34b8d1','bb7eceae-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-21 14:27:25'),
('bdeb4534-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8246-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed081-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,1,1,0,0,'2025-09-20 03:56:22','2025-09-21 14:24:05'),
('bdeb5813-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8246-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed147-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdeb6945-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8246-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed17d-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdeb7d4c-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8246-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdeb95ba-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8246-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1e3-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdebaada-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8246-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed225-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdebbf46-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8246-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed250-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdebd32c-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8246-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed288-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdebe699-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8293-95b4-11f0-b1e6-60ff9e34b8d1','bb7eceae-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdebfc6c-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8293-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed081-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdec1384-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8293-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed147-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdec2498-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8293-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed17d-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdec3533-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8293-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdec4534-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8293-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1e3-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdec5add-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8293-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed225-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdec79c7-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8293-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed250-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdec8e9f-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8293-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed288-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdec9fe6-95b4-11f0-b1e6-60ff9e34b8d1','bb7f82d6-95b4-11f0-b1e6-60ff9e34b8d1','bb7eceae-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdecc9cd-95b4-11f0-b1e6-60ff9e34b8d1','bb7f82d6-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed081-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdecd9a7-95b4-11f0-b1e6-60ff9e34b8d1','bb7f82d6-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed147-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdecea2b-95b4-11f0-b1e6-60ff9e34b8d1','bb7f82d6-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed17d-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdecfbbe-95b4-11f0-b1e6-60ff9e34b8d1','bb7f82d6-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bded0cb8-95b4-11f0-b1e6-60ff9e34b8d1','bb7f82d6-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1e3-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bded1cba-95b4-11f0-b1e6-60ff9e34b8d1','bb7f82d6-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed225-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bded3294-95b4-11f0-b1e6-60ff9e34b8d1','bb7f82d6-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed250-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bded492d-95b4-11f0-b1e6-60ff9e34b8d1','bb7f82d6-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed288-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bded5d55-95b4-11f0-b1e6-60ff9e34b8d1','bb7f831a-95b4-11f0-b1e6-60ff9e34b8d1','bb7eceae-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bded7291-95b4-11f0-b1e6-60ff9e34b8d1','bb7f831a-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed081-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bded8482-95b4-11f0-b1e6-60ff9e34b8d1','bb7f831a-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed147-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bded95fa-95b4-11f0-b1e6-60ff9e34b8d1','bb7f831a-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed17d-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdeda66c-95b4-11f0-b1e6-60ff9e34b8d1','bb7f831a-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdedce41-95b4-11f0-b1e6-60ff9e34b8d1','bb7f831a-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1e3-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdede3c4-95b4-11f0-b1e6-60ff9e34b8d1','bb7f831a-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed225-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdedf5ba-95b4-11f0-b1e6-60ff9e34b8d1','bb7f831a-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed250-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',0,0,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdee0cc6-95b4-11f0-b1e6-60ff9e34b8d1','bb7f831a-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed288-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,0,0,0,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdee2171-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8363-95b4-11f0-b1e6-60ff9e34b8d1','bb7eceae-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdee3526-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8363-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed081-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdee495a-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8363-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed147-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdee5a33-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8363-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed17d-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdee6d3c-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8363-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1b0-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdee7e76-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8363-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed1e3-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdee8e5a-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8363-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed225-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdee9ea9-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8363-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed250-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37'),
('bdeeae90-95b4-11f0-b1e6-60ff9e34b8d1','bb7f8363-95b4-11f0-b1e6-60ff9e34b8d1','bb7ed288-95b4-11f0-b1e6-60ff9e34b8d1','bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1',1,1,1,1,1,'2025-09-20 03:56:22','2025-09-20 04:04:37');
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping data for table `audit_config`
--

LOCK TABLES `audit_config` WRITE;
/*!40000 ALTER TABLE `audit_config` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `audit_config` (`id`, `setting_name`, `setting_value`, `description`, `updated_by`, `updated_at`) VALUES (1,'audit_enabled','true','Master switch for audit system',NULL,'2025-09-20 03:41:29'),
(2,'log_level','detailed','Logging level: basic, detailed, verbose',NULL,'2025-09-20 03:41:29'),
(3,'retention_days','730','Audit log retention period in days (2 years)',NULL,'2025-09-20 03:41:29'),
(4,'async_logging','true','Enable asynchronous logging for performance',NULL,'2025-09-20 03:41:29'),
(5,'track_content_changes','true','Track detailed content changes',NULL,'2025-09-20 03:41:29'),
(6,'track_prompt_analytics','true','Track and analyze user prompts',NULL,'2025-09-20 03:41:29'),
(7,'performance_monitoring','true','Monitor generation performance metrics',NULL,'2025-09-20 03:41:29'),
(8,'export_tracking','true','Track exports and integrations',NULL,'2025-09-20 03:41:29');
/*!40000 ALTER TABLE `audit_config` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping data for table `system_modules`
--

LOCK TABLES `system_modules` WRITE;
/*!40000 ALTER TABLE `system_modules` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `system_modules` (`id`, `name`, `display_name`, `description`, `route_path`, `icon`, `module_order`, `is_active`, `created_at`) VALUES ('bb7eceae-95b4-11f0-b1e6-60ff9e34b8d1','ideas','Ideas','Business ideas and use cases','/v1/use-cases','lightbulb',1,1,'2025-09-20 03:56:18'),
('bb7ed081-95b4-11f0-b1e6-60ff9e34b8d1','work_items','Work Items','Requirements and work items management','/v1/requirements','clipboard-list',2,1,'2025-09-20 03:56:18'),
('bb7ed147-95b4-11f0-b1e6-60ff9e34b8d1','design','Design','System design and architecture','/v1/design','palette',3,1,'2025-09-20 03:56:18'),
('bb7ed17d-95b4-11f0-b1e6-60ff9e34b8d1','code','Code','Code generation and management','/v1/code','code',4,1,'2025-09-20 03:56:18'),
('bb7ed1b0-95b4-11f0-b1e6-60ff9e34b8d1','test_cases','Test Cases','Test case management','/v1/test-cases','test-tube',5,1,'2025-09-20 03:56:18'),
('bb7ed1e3-95b4-11f0-b1e6-60ff9e34b8d1','execution','Execution','Test execution and results','/v1/execution','play',6,1,'2025-09-20 03:56:18'),
('bb7ed225-95b4-11f0-b1e6-60ff9e34b8d1','defects','Defects','Defect tracking and management','/v1/defects','bug',7,1,'2025-09-20 03:56:18'),
('bb7ed250-95b4-11f0-b1e6-60ff9e34b8d1','traceability','Traceability','Requirements traceability matrix','/v1/traceability','git-branch',8,1,'2025-09-20 03:56:18'),
('bb7ed288-95b4-11f0-b1e6-60ff9e34b8d1','dashboard','Dashboard','Analytics and reporting dashboard','/v1/dashboard','bar-chart',0,1,'2025-09-20 03:56:18');
/*!40000 ALTER TABLE `system_modules` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping data for table `vector_stores`
--

LOCK TABLES `vector_stores` WRITE;
/*!40000 ALTER TABLE `vector_stores` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `vector_stores` (`id`, `name`, `database_name`, `embedding_provider`, `embedding_model`, `embedding_dimension`, `description`, `document_count`, `created_at`, `updated_at`) VALUES ('6b461c33-7f4f-11f0-b23f-60ff9e34b8d1','safe_documents','aura_playground',NULL,NULL,NULL,'SAFe framework documentation and guidelines',0,'2025-08-22 11:59:02','2025-08-22 11:59:02'),
('6b46291d-7f4f-11f0-b23f-60ff9e34b8d1','work_items_context','aura_playground',NULL,NULL,NULL,'Work items context for intelligent search',0,'2025-08-22 11:59:02','2025-08-22 11:59:02'),
('6b46398d-7f4f-11f0-b23f-60ff9e34b8d1','design_documents','aura_playground',NULL,NULL,NULL,'Design documents and technical specifications',0,'2025-08-22 11:59:02','2025-08-22 11:59:02');
/*!40000 ALTER TABLE `vector_stores` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping data for table `aurav2_workflow_stages`
--

LOCK TABLES `aurav2_workflow_stages` WRITE;
/*!40000 ALTER TABLE `aurav2_workflow_stages` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `aurav2_workflow_stages` (`id`, `name`, `description`, `icon`, `stage_order`, `workflow_type`, `definition_of_ready`, `key_players`, `definition_of_done`, `activities`, `reference_documents`, `ai_consolidation_enabled`, `created_at`, `updated_at`) VALUES ('idea','Capture Idea as Business Brief','Outlines a new business idea and facilitating effective decision-making','lightbulb',1,'both','[\"Idea to be pursued identified\", \"Business features or tech enablers defined\", \"Business Sponsor identified\"]','[{\"role\": \"business_owner\", \"name\": \"Business Owner (BO)\"}, {\"role\": \"business_sponsor\", \"name\": \"Business Sponsor\"}, {\"role\": \"portfolio_leadership\", \"name\": \"Portfolio Leadership\"}]','[\"Idea captured as Business Brief\", \"High level impact analysis completed\", \"Ready to be Qualified\"]','[{\"owner\": \"BO\", \"activity\": \"Raise and submit the Idea via the Idea Management tool\"}, {\"owner\": \"BO\", \"activity\": \"Present the idea to stakeholders\"}, {\"owner\": \"MPD\", \"activity\": \"Perform internal business review and Impact analysis\"}]','[\"Idea Management App\", \"Idea Management Workflow\", \"Small Enhancement Guidelines\"]',1,'2025-08-17 06:06:10','2025-08-17 06:06:10'),
('prioritize','Prioritise the Initiative','Initiative prioritised by business & IT to pull from Portfolio funnel','list-ordered',3,'both','[\"Idea qualified as Initiative\", \"Initiative added to Portfolio funnel\", \"Latest updated view of Portfolio roadmap\"]','[{\"role\": \"business_owner\", \"name\": \"Business Owner (BO)\"}, {\"role\": \"vp_portfolio\", \"name\": \"VP Portfolio\"}, {\"role\": \"portfolio_leadership\", \"name\": \"Portfolio Leadership\"}]','[\"Initiative prioritized and PPM updated\", \"Stakeholders aligned\", \"Build/buy decision revalidated\"]','[{\"owner\": \"MPD\", \"activity\": \"Review and prioritise initiative and capture in PPM portfolio\"}, {\"owner\": \"MPD\", \"activity\": \"Update and present Roadmap to stakeholders\"}, {\"owner\": \"VP\", \"activity\": \"Manage capacity and priority conflicts\"}, {\"owner\": \"MEA\", \"activity\": \"Provide inputs on technical complexity and NFR requirements\"}]','[\"PPM Tool\", \"Non-functional requirements\"]',1,'2025-08-17 06:06:10','2025-08-17 06:06:10'),
('qualify','Qualify the Idea','Research, filter and assess new business ideas against available products','search',2,'both','[\"Business brief captured\", \"Idea impact assessment completed\"]','[{\"role\": \"business_owner\", \"name\": \"Business Owner (BO)\"}, {\"role\": \"portfolio_leadership\", \"name\": \"Portfolio Leadership\"}, {\"role\": \"art_leadership\", \"name\": \"ART Leadership\"}, {\"role\": \"pmo\", \"name\": \"PMO\"}]','[\"Idea qualification complete\", \"Owning ART identified\", \"Build/buy decision preliminary\", \"Business brief qualified\"]','[{\"owner\": \"MPD\", \"activity\": \"Manage the Idea Backlog and lifecycle\"}, {\"owner\": \"BO\", \"activity\": \"Present the business brief to IT stakeholders\"}, {\"owner\": \"MPD\", \"activity\": \"Evaluate and prioritise ideas with required players\"}, {\"owner\": \"MEA\", \"activity\": \"Review feasibility with Business Platform teams\"}]','[\"Idea Management App\", \"Generic Service Level Agreement\", \"Small Enhancement Guidelines\"]',1,'2025-08-17 06:06:10','2025-08-17 06:06:10');
/*!40000 ALTER TABLE `aurav2_workflow_stages` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping data for table `aurav2_user_roles`
--

LOCK TABLES `aurav2_user_roles` WRITE;
/*!40000 ALTER TABLE `aurav2_user_roles` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `aurav2_user_roles` (`id`, `user_id`, `email`, `name`, `role`, `department`, `is_active`, `created_at`, `updated_at`) VALUES ('45a27258-7b30-11f0-b114-60ff9e34b8d1','admin','admin@emirates.com','System Administrator','portfolio_manager','IT',1,'2025-08-17 06:06:10','2025-08-17 06:06:10'),
('45a273e2-7b30-11f0-b114-60ff9e34b8d1','demo_po','po@emirates.com','Demo Product Owner','product_owner','Business',1,'2025-08-17 06:06:10','2025-08-17 06:06:10'),
('45a27490-7b30-11f0-b114-60ff9e34b8d1','demo_pm','pm@emirates.com','Demo Product Manager','product_manager','IT',1,'2025-08-17 06:06:10','2025-08-17 06:06:10');
/*!40000 ALTER TABLE `aurav2_user_roles` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping data for table `safe_mappings`
--

LOCK TABLES `safe_mappings` WRITE;
/*!40000 ALTER TABLE `safe_mappings` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `safe_mappings` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping data for table `permission_types`
--

LOCK TABLES `permission_types` WRITE;
/*!40000 ALTER TABLE `permission_types` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `permission_types` (`id`, `name`, `description`, `created_at`) VALUES ('bb7efeaa-95b4-11f0-b1e6-60ff9e34b8d1','module_access','Basic module access permission','2025-09-20 03:56:18'),
('bb7f0073-95b4-11f0-b1e6-60ff9e34b8d1','read','Read permission for data','2025-09-20 03:56:18'),
('bb7f00f2-95b4-11f0-b1e6-60ff9e34b8d1','write','Write/modify permission for data','2025-09-20 03:56:18'),
('bb7f0114-95b4-11f0-b1e6-60ff9e34b8d1','delete','Delete permission for data','2025-09-20 03:56:18'),
('bb7f0132-95b4-11f0-b1e6-60ff9e34b8d1','admin','Administrative permission for module','2025-09-20 03:56:18');
/*!40000 ALTER TABLE `permission_types` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping data for table `organizational_levels`
--

LOCK TABLES `organizational_levels` WRITE;
/*!40000 ALTER TABLE `organizational_levels` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `organizational_levels` (`id`, `name`, `hierarchy_order`, `description`, `created_at`) VALUES ('bb7e788d-95b4-11f0-b1e6-60ff9e34b8d1','executive',1,'Executive Vice Presidents, Senior Vice Presidents, Vice Presidents','2025-09-20 03:56:18'),
('bb7e7aae-95b4-11f0-b1e6-60ff9e34b8d1','portfolio',2,'Portfolio level managers and directors','2025-09-20 03:56:18'),
('bb7e7b61-95b4-11f0-b1e6-60ff9e34b8d1','art',3,'Agile Release Train level roles','2025-09-20 03:56:18'),
('bb7e7b90-95b4-11f0-b1e6-60ff9e34b8d1','team',4,'Feature team level roles','2025-09-20 03:56:18');
/*!40000 ALTER TABLE `organizational_levels` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping data for table `work_items_context`
--

LOCK TABLES `work_items_context` WRITE;
/*!40000 ALTER TABLE `work_items_context` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `work_items_context` (`id`, `document`, `embedding`, `metadata`, `created_at`, `updated_at`) VALUES ('test_epic_001','EPIC: User Authentication and Authorization - Implement secure login system',0xCACB17BD8FA6F8380BCBABBC8EE9FEBBC412BE3CC329003DDFBC07BB578B123D2AB54B3DC084383B0B3A763DC0B07CBD76E47C3B0A7DFC3C537700BCB3A3BABC05A307BC7D91BD3C289520BDBD70A63C6D65403C35E5683DFC0C093D6B45153DD7524D3B90DD653C928EC6BC885210BC578B12BBDA7D21BDF277FA3BB90EE5BCC8D7B0BCF804103C89CC033DD752CDBC890F8A3C3B9E423D8313AA3C2E91003CBB93813C6680223C09D7C43ACB458B3BCA8811BD09AB003D46CEDFBC5680E9BCF51CC23CE376D1B8AAD64EBDCAB455BCBDEA993C1732B63C9D0C13BC7B3A25BBB1F259BC2BECB8BC3EF55ABD50153F3DEFF41DBD53FD0CBD44DA783C65B8FF3BEB2392BB04985EBD5D9CF4BC716DB9BCC21E573D290F143D56119F3C40A63BBCFE2CB4BB41DD283BF33F9DBCDA665F3A073D26BC3DBE6D3D3753C3BC722A33BD9A24C5BC4E64DEBC67B70FBDDB7108BD795D00BD62F21CBDA73CB0BDE11FB93C7E7AFBBC99AA51BD6575793C704D0E3D4554ECBCC97D683C66EF6C3DA4289E3C7E7AFBBB685DC73C01FEBFBB1CE0E63B1CE0663CD16D2FBD13612ABD2A8987BC16B8423D24FCF13B461C8FBA244A213D17AC29BDE6E42BBD12E7B6BD89CC033C8256303C2382FEBB483C3A3CF3FC16BDE2C5703DE062BFBCFAE1B4B9D9C0A73B4E21D83CA183563C031EEB3C4CB37DBD3D38E13CD2D0E0BC7BB418BD0278333C816249BD6B4515BB6B889B3CC1BB25BD8F63723DE11FB9BCE433CBBCE4334B3DCF900A3DDF4294BC45546CBC780FD13C465F15BD40202FBD4554ECBB9FA6B1BC0361F1BBE11F39BDAEB283BC541D383CB2AFD3BCCD9C233CB5541BBD563D63BC1FC8B43C878AED3C45546C3C2B187DBDB9CBDE3BFB87ECBBEBD5E23B20FFA1BB56FADCBC3382B7390874933C29529ABB78E38C3B9AF800BD0412523BD5FBB4BC375343BDB597A13C131E24BD4E2158BC636C90BC7852573C3EC9963C7EC82ABDDBF7143D0E9CB7BC21F308BC69D73A3CCA3A62BC13D074BCB9CBDEBB858104BDB7EEB9BAE71B993CEC0C503DB26CCD3CE14B7D3C17ACA93C856A423DDDD4393D5EEA23BD7CEB85BD5D70303C091A4BBD6084C23C3DBEEDBC4F2C81BBC2AF8C3B324B4ABD36AD8BBBD632A23CD156EDBC5E16683AF7CD223C50D2383B0A7DFCB9951C4CBC34FC2A3BF6532F3D66C3283DE1DCB23B57488CBC6141BCBCD16D2F3C6E59273BA4AE2ABA32620C3D568069BDB08F28BDD28D5A3C464853BC406335BC46CE5F3DB041F93CA3F1303D6141BC3C80A5CF3B4930A1BB6E5927BCFA50FFBB248DA73C195D8ABCABCA35BC7D17CA3AE4C4803CD28D5ABC0361F13CAEF5893B2C662CBC100A123DBA4552BD24B96B3C83D023BDDB23D9BBC4CFB7BC8852903C2CD5F63AC6FA8B3C99674BBC1F0BBB3C99AA513D5BD611BD1B66F3BBD5B82EBD6278A93C3308C43C1E4E413B290F143C366A05BBB0FEF23BAF1535BDCA0E9E3CC506A5BCCFBC4E3DFB44E6BC13D074BB09D7C43BD7690FBB86107A3CE2C5703D77D8E33AF23474BCB9CB5E3C8FF427BBC6FA0B3DF804103CD2D060BC266A4C3D434B03BC56FADCBCC903753C885210BAF5D93B3DF433843DB0BBECBCF4E554BD36D9CFBC5CF6BC3CF18E3C3C63AF163AD1566DBDF653AF3C1E6503BBBA02CCBC05CFCB3BF208303CB329C7BCFC92153D5DDFFA3CEA18E93C2BA9B2BC74814B3B94FCA03C4CCA3F3CEB66183DBDEA193D42D10F3B014146BC0FD324BD4FDE51BD306EA53C3AF80A3DFB1822BDD1DCF9BCB6CE0EBBCD9CA3BC2C66AC3CAF84FFBCC21ED7BB6D4EFEBCC23519BDCB450BBD126D433DF74716BD885210BD6575793C61BB2F3D77D8E3BB99674BBC745507BD41DD283B155591BDCA3AE23CE4C4003DEBD5E23C6DDF333D577450BBB0FEF2BBEE7A2ABDD34A54BD05CFCBBCC549ABBCF6532F3C4648533CB1C615BC34AE7B3DFE6FBABCCA3AE23B17AC29BD76E47CBB76E4FCBC66EFEC3B073DA6BC36AD8BBDFACAF23CB2AFD3BCA919D5BC4D70773A2476E53B902B953CF87E033D9FE9B7BBC506253C17EF2F3C388A30BC0BB4E9BC19A010BC91A508BD7EC82A3B47C246BC388AB0BCC398CA3BB99F9AB8AC87AF3D61413CBCCACB173CE213203CABCA353D0C2EDD3C6FFF5EBCFA507F3DDFFF0DBD21360F3D3F2CC83C4796823C7036CCBCEA5B6FBBDA665FBB9208BABA2FBDC4BC9D0C133D3C447A3C3CD5AF3C0DA8D0BCA61C853D537700BC0B3AF63C95AD01BD1CE0663C4BE1813C67265A3C91E80EBD704D0EBB947694BCB5549B3C0CBF923AD9B5FEBCAF15B5BCCD22B0BBEC0C503AA2BAC33C570586BC6B028F3DEC9D85BA27E4BF3CA4AE2ABD951C4C3CC261DD3CE80F80BC06C332BC871B23BD7E4EB73C2FBDC43C95F087BC1DA8893DDF4214BD5A9F24BCE85206BCAEB2833B78E38C3C9C4F99BC7C2E8C3BD39803BD3C92A9BC6A51AE3A2533DF3C8B6622BD56111F3D361CD63B461C0FBDDE859ABB7826133C5DDF7ABC1732B6BBBCB32CBD4B2408BDFA9E2E3C244A21BBF4B910BB76A1763B9FE9373D1B7D353D031E6BBD005808BDBA45D23B02A4773A6549B5BC7989C43CBB7CBF3C0CEBD63BC36C06BC563D633D8A723B3D25335FBDF4E5D4BCE1992C3C25ADD23C3EF55ABC9D8606BC5DB3B6BC8299B63B5DB336BCD3DB89BCE83B44B95FDE0A3A3D4FA33CE10877BCFB44E63C7AC0313C2CD576BCF87E83BC7D17CABCCB02053C731E1A3DB41DAEBB34FCAABC1C9DE0BCDB23593C59E2AA3CE14B7D3C65B87F3D685D47BC683103BD95AD01BD8C231CBCF3FC96BD2D86573D0A94BE3C1DD44D3D2D0CE4BC71F345BD16753C3D056081BC9D0C933A12E736BD2299C0BC08B719B9C81A37BC4E64DEBBF87E83BC971033BBC398CAB85DDFFA3B5DDFFA3A18269D3BD8893A3D59E2AABC35761E3CCF79483CE7D812BC1B3A2FBCAF15353CD5FBB4BC2B187DBC887ED4BC1407E2BC3D0C1DBD3AB5043D7B3A253D479682BBAA93483DF3285BBC00DE14BCD481413DE3FC5DBD6E16A13A6B889B3B813605BDCF79C83CD34AD4BB8162493C4CCA3F3ADAEC6B3A56CE98BC9C4F19BDF01449BC138DEE3C3BE1C8BCD0B035BC8747E7BC045558BC30B1AB3B343F313C12E7363CDE851ABC16B8C2BB55C36FBAC1E7E93B0DA850BCFC384DBA2D86573D2356BABC09D744BD4BE1013D441D7F3CCAB4553BB951EBBC1CB4223D2CD576BC94B91A3D1E9147BDFB18223D1407623D7C2E8C3B41DDA8BCF74716BDA825EE3BA64849BCD1E7A2BCE0E8CBBB722AB33BB041F93C49B62DBD39C11DBDC6FA8B3C609B043CDFFF0DBDDBF7143DD72689BCE85286BBC68098396CEB4CBC3D0C9D3CE6A1A53CE23FE43C53FD8C3C537700BC2F7ABEBCA2FDC93BA009E3BBA95CDBBC0A0EB2BCE23F643AA1C6DC3C0D7C0C3CC5C31E3D11B0493C8FF4A7BB0FD3243B933FA7BCC1781F3C5925B13CB825A7BC9DC90C3CAC87AF3B2A89073D09EE86BC7DD4C33C275EB3BC1DD4CDBBC7E3C93CFA5BA83CECC949BB0A7D7C3CBA5C14BD3F2C483CDAEC6BBDD398033C44F13ABBD752CD3C93C5333D36F011BC7FF46EBCDAEC6BBD346BF53B131E243DEC9D85BC50D238BC80798B3CF4A24EBC5A5C1E3C736120BD77955DBCC084383C8F63F2BC6E85EB3C7361A0BC7A03B8BC366A853C1F85AE3CC4CF373D0B3AF63C4597723CED00B73B7675B23CE87E4ABC44AE343C25810EBC563D63BC933FA73B16B8C2BC95AD813CD72689BCE2C5F03CCAF75BBDC2F292BB31A512BC22B0823C1E6583BCD398033D419AA2BC231334BBB4DAA7BBBEA7933C906E1BBD7D91BDBCD97278BC233FF83C8FF427BB343F313DED86433C91A508BCAB0D3CBB76E4FCBC5F4DD5BB911453BCCC65B63B3EF5DABB5CF63CBCB8D777BCE21320BD312B9FBC24B96BBC4930A13B902B15BDFBD59B3C02A477BCFB4466BD13137BBCCF4D043D0560813C53FD0CBD5C7CC9BBC549AB3CD26116BD7C71923AE9F83D3CA9ED103AE3B9D7BC9E4300BCD1DCF93AF14B363D3428EF3CC12A703CA9731DBC5506F6BA058CC53CD2D0E0BC4DBEA6BB6D22BA3C2ED486BC80BC11B913A430BCDF42943AC21ED73C83D0233D4F2C01BDC0FEAB3C11C70BBD741281BD92083A3DAE214EBC7D91BDBCBAD607BBF2F1ED38E7D8923C5FDE8ABC24FCF13C07FA1FBD244AA13CCACB17BDD0F3BBBB67B78F3C9C4F193B2B2F3F3B5774D03CFE2CB43CF9AA473D880461BCE34A0D3C8610FABB6E0B78BC25335FBC916282BCED86C33CC1BBA53CA14050BDAF847FBA7DD4C33C53FD8C3D34AEFBBC12E7B63CC506253CA5E597BC66C3A8BB70364C3D0C451F3C89F8473BC7E3C93C36D9CFBC537780BCECC9493D88C15A3D951C4CBD8D5A89BA9D0C133D00DE94BCC084383C4BE181BC3BE1C83B6831033C6E0B78BD6506AFBC0560813B19A0903C99AAD13C74980DBB1B7DB5BBFFA6A7BA343F313C4F2C01BD6F42E53B9C921FBC13612A3B4705CDBCCE1697BD131EA43AE11FB9BCE6E42BBD0B3A763C6F42E53B1D5ADA3CFB01603CE5AD3EBB623523BD4D01AD3C66ACE6BC27E43FBDDB23593C951CCC3BC261DDBC875EA93A2C92703C0BB4E9BC1A03C2B9F3FC96BC53FD0CBD7E7A7BBC5C7C493DA91955BB70C701BDB6B7CC3BF804103CD0B0B5BC83132ABDC846FBBBB8682DBDCACB173DE4C480BC2179153D5A9F243CE4C480BB14DB9DBC046C9A3C7852D7BC6ACBA13C22B082BA1B3AAF3C3F2CC8BC88C1DABBCD9CA3BC9476143BAF84FF3C704D0EBDC1E7E93CE14BFDBC780FD1BBFAE1B4BB91A5883C36F011BDC36C86BB59E2AABC6E0BF83C5F905BBDF33F1DBC813685BC7C2E8CBD98049ABC8804613C3DBE6D3C73DB933C1C23EDBC1E4EC13CF7CD22BDC81A373D722A333C9F15FCBCC084383AB68B883C87CD733C13A430BA8A2FB53B2C23263C0B8825BD7455873C43BA4D3D53FD8C3AE38D133DDBF7943B459772BC4597F2BC2042A8BB3EF55A3BF02B8BBC1581D5BC9114D33C446BAEB822B0023C887E543CF2777A3D6769603C0B3AF63B7F85243D35E5683CA930173C0BF7EFBA1B3A2FBC5E59EE3BD575283DBA198EBC25F058BB94B99A3CA020A53980BC91BCD199F33C22DC463CF02B8BBCD80FC7BC05A307BDF653AFBCFBD59B3C0A94BE3CE52732BCBF4DCB3C37103DBCF3285BBC7632ACBBCC65B6BC6E59A73CED00B73C6E85EBBC275EB3BC4D2D713B9D0C133CA919D5BC6994B43C0874133DCC65B6BB765E70BD771BEA3B6141BCBC1DA8893D99C1933CCD9C23BDB5549B3CD26196BC144A683C0C0219BC997E0D3D82DC3CBB221F4D3C528399BB5774D03C34FCAABCFACA72BC087493BCA2BAC3BCC846FBBC5B938B3C1CB4A23B8162C93C50D2B8BC290F94BCFAE1B4BCEEBDB03CBA45523D6632F3BA118405BC10901E3D74980DBC497327BD8747E7BCFDF546BBA04CE93CCE1617BDE07901BD902B15BC1E91473C153ECFB8FDF5C6BA144AE83CA99F613D5968B7BBF87E833CC12A703C34FCAABCCA0E1E3DCAF75BBDEB66183D8852103C4F2C013DFDF5C6BCA95C5B3C44AE34397FF4EE3BDBB40E3D2A4681BC6C7C82BBB82527BD6CBF88BDCCA8BCBC43BA4DBB73DB933BEAEC24BC153E4FBCC3984A3B3EF5DA3CD213E7BC4AED1A3DD2A49CBC5C39C3BAD1DC79BCE3B9D7BCC48C31BD8FB1A13B0C71E33B02A477BCFE2C343CC97D683C173236BD0C459F3C6CA8C6BC7EC82ABCB178E6BCED0037BCF7CD22BC144AE83BF8C1893C2FBDC43B446BAEBB03F226BB158155BDBA5C94BC9710333C4597F23C6E85EBBB36D9CF3CB81A7E3B8804E13B7F8524BC53FD8C3C80A54FBCE07981BCDB23D93CFDF546BCF2C5A9BB35A2623CA5E517BDDC5A46BC35E5E83B3EB2D43CF804103A75B838BB8C9D8FBC5F4DD53C6549353B8E7AB4BC88C1DA3C1581D5BC1E4E413D7F6EE2BAAB0DBC3B98B6EABC7361A0BCA1C65C3C8804E1BA005888BA8B66A2BBA95C5BBC24B9EB3C0D7C8C3B229940BB4334413DDBB40E3D4CCABF3C0D65CABCBC39393BC1A4E33A6F42E5BC9E4300BD191A843BC68098BC528319BDE9F8BDBCC549ABBA7C7192BCAD3810BB366A05BCC2615D3B90DD653D08B719BB63298A3CC04132BDDEC8203C94B99A3CE527B23C74980DBB80A54FBCEB4FD6BBD752CD3C99AA51BC0C451FBC2DC95D3CE3FC5D3D14DB1D3B9FE9B7BC673D9C3CFA9E2EBB1D17543D22B0823CD3DB09BC5F90DB3C11C78B3CEA9EF53CCB71CFBA3382B73B700A88BD20FF213DB511953C02A4F7BCC2AF0CBD09EE863CF747163CDC5A463BEA5BEFBCF3FC16BDD575A83C2D86D7BCDDD4B93CFA507F3C76A1763CD2A49C3B0C02193C32620CBDAA93C8BB0D7C8CBC8627BC3B2BA932BC57480CBC4CB3FDBCF87E033CE9E17BBB9057593BB5541BBC17EFAFBC89CC833BF43304BD8BA9A83CD9C0A73CDD4EADBB69D7BA3CBF0A45BCB8D7F73BEB4F56BC479682B94AAA943DEE37243D468BD93CB90E653C2A72C53A02A477BCEEBD303CBA45523DE407873BC2F2123B56119FBB8F372EBC66AC66BC2ED4863A4BE101BD4C87393CEE7AAABC0DA850BC281B2D3DE23FE43B0E9C37BCA86874BBE079013C434B833CBEA713BD366A05BD3DBEED391498173C56119F3CC63D123D23827EBCB2838F3B3AF88A3C0BF7EFBBD307CEBB5F4DD5BB9F157C3C1CE0E63BB731403CF3AEE73B3C92A93B247665BCA9ED103D8E0041BB41579CBC5D70B0BB6EC8F13AC0B07CBCBCB3ACBAF5D93B3C8D5A89BBC1789F3C9873643C780F51BCC97D68BB24FCF13BBFDE803C98041A3D1A03423D8804E13BCC65363C62F21C3D8627BCBC8852103D0C451F3BEFB1173C890F0ABD6CA8C63C3428EFBCF80490BCA8256E3C5968373DEFB197BC43BACDBB014146BC3533183DD94634BCFA0DF93CD1E722BDEA9EF53C528319BDF87E83B96A51AE3B8D5A89BC7BB418BCEB4FD63CC9C06E3D4F2C01BC27E43FBC0CEBD63A973CF73B5F0ACF3B27E43F3DEBD5623C978A26BC5F4D55BC7B3A25BD4648D3B8388AB03CAF15B53CD34AD43BB81AFEBB5240133C5968B73C5E1668BDFCBED9B91C719C3CD16DAFBBC32900BDF3AEE7BA2C92703C9847A03CEB23923A7989C43C43BACD3C9873E4BA59E22ABCAEDE47BB1A03C2B616753CBCDFFF8DBC76A1F63B5BD611BC578B123CC846FB3C03DB643CE87E4ABC3C18B6BBC8467B3CEA1869BC4B50CCBBB2FD023C6D223ABD776919BAA7ABFA3CD72609BCFB876CBBE972B1BB7C2E0CBC08B799BC663273BD9653393BAF58BBBCAAD6CEBCD19973BC3C44FA3B5C7CC9B9F0E8843C57B7563CB9CBDEBC4D70773C53E64ABB627829B9056081BB8B66A23B67E3533C4D7BA03C10901E3C0235ADBCB26CCDBBC63D12BD3EF5DA3A07FA9FBC673D1CBC4DEAEA3C91E80EBBB0D2AE3CC5492BBD80E8553C18261D3D4063B53CBA45D2BCF1D1423D57488C3CDBE0D23C7361A0BC78E30C3DF45FC8BA7079523CFDC9023D3A3B113B825630BDD7E3023CCF79C83AB825273CEF6E913C1D1754BB4597723CCB0205BD58EEC33BC2615DBBC0B07CBC0058883C6ACB213BA8E2E73B3D38613C0455583C6CEBCCBC95338EBBDE0BA7BBF23474BC74980DBBA99FE13C0412D2BB7036CCBC880461BCC329003C6ACBA1BAE0A545BCCFBCCE3CBD2D20BC4334C13B78E30C3D04985E3DA7AB7A3B0F59B13CCB2E493D6769603CF36BE1BCB68B88BCCFBCCE3CFDC982BB7FF4EEBB798944BDF4B9103C15120BBD55497C3B99EDD7BB18E396BBFCBE593C09EE063D17AC29BC17EFAFBA700A08BB9F157CBC0412523CFF6321BDC0FEABBA6B881B3B6FFF5EBCEC0C50BA23D02DBD780F513AB6CE8E3C78A0063D2E004BBC578B923DFB44663C798944BD195D0A3C82DC3C3BCAB4D53B31E818BB2E43D1BCC1E7E9BC67E3533C08310D3900DE14BC30B1ABBC592531BCA61C05BD9CD5A53C3EB2543CE199ACBCFB18223BCA8891BC4DBE26BA3AB504BC29CC8DBC13137BBC1D17D43B5DB3B6BC1DA8893B5F6497BB829936BD5C3943BC9A24C53C6EC8F13CD481413C37103DBD80E8D5BBE852863CEB4FD6BA8AB5C1BC4E381A3D6575F93B2299C0BC02A4F73B933FA73CF2777ABCA73C303D3C92293CFC384DBCA5E5173D6DDFB3BC9F63ABBC29CC8D3D88C15ABC35A2E23B8136853C421416BC7F6E62BC909ADF3CA4AEAAB97F429E3B77D8E3BB55C36F3B153E4F3DA868F4BC58AB3DBCC4CF373DFC384DBD34FCAA3C104D18BC802B5C3C1F0BBB3C58EE43BA5DDF7A3A2533DF3A6FBC583C104D183DA99F61BC5CF63C3C4E21583DB26C4D3DFB44663908318D3B67E353BBAD38903CC355C4BCBEA7933C4EA7643C12E7B63C4F6F87BC2ED406BCBE21073CFB44E6BB2382FE3CE7950CBCA8E2E7BB9E2C3EBD3F0084BB2DE09F3CE6A1253B14C4DB3C31E898BC1407623C1313FB38B8682DBC99AA51BD56CE183DBE21873CAA9348BC28D8263DEFB117BD5E16E83C3428EF3CD972F8BAC12AF0BC144AE8BCBFC7BEBC35E5E8BCCA0E9E3C95330EBD6F90943B993B07BC6D4E7E3C5774D0BC09EE863C6726DA3C25818E3C771BEABB8F37AEBB56FADCBC6CBF08BCA8F929BBB8682D3B21360F3D91E80EBC5F0ACFBCCB2EC93B5554253CA1148C3C3D0C9DBBA55F8BBCEA2FAB3C1D5ADA3B8FA678BCFBD51BBD,'{\"type\":\"epic\",\"title\":\"User Authentication and Authorization\",\"source\":\"test\"}','2025-08-14 19:51:25','2025-08-14 19:51:25');
/*!40000 ALTER TABLE `work_items_context` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-09-22 20:55:53

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- LOCAL DATABASE REPLICA COMPLETE
-- Ready for user-driven transactional data entry
-- =============================================



