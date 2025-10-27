-- Enable realtime for comments table
ALTER TABLE public.comments REPLICA IDENTITY FULL;