-- Create user_analytics table for tracking user registration and login data
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE user_analytics (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  login_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on user_id for faster queries
CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);

-- Create an index on registration_date for analytics queries
CREATE INDEX idx_user_analytics_registration_date ON user_analytics(registration_date);

-- Create an index on last_login for activity tracking
CREATE INDEX idx_user_analytics_last_login ON user_analytics(last_login);

-- Enable Row Level Security (RLS)
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to read their own data
CREATE POLICY "Users can view own analytics" ON user_analytics
  FOR SELECT USING (auth.uid() = user_id);

-- Create a policy that allows the system to insert new records
CREATE POLICY "System can insert analytics" ON user_analytics
  FOR INSERT WITH CHECK (true);

-- Create a policy that allows the system to update records
CREATE POLICY "System can update analytics" ON user_analytics
  FOR UPDATE USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_user_analytics_updated_at 
  BEFORE UPDATE ON user_analytics 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
