-- NexusLab Database Initialization Script
-- This script runs automatically on first container start

-- Create additional indexes for performance
ALTER DATABASE nexuslab CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create indexes for better query performance (applied after table creation in migrations)
-- These are placeholder indexes that will be created via Laravel migrations

USE nexuslab;

-- Grant permissions (if needed for additional users)
-- GRANT ALL PRIVILEGES ON nexuslab.* TO 'nexuslab'@'%';
-- FLUSH PRIVILEGES;