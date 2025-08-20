from supabase import create_client
import os
from dotenv import load_dotenv
load_dotenv('.env.local')
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)