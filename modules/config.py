import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Configurações de API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Caminhos de arquivos
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_DIR = os.path.join(BASE_DIR, "db", "companies")
DRAFTS_DIR = os.path.join(BASE_DIR, "outreach", "drafts")
DATA_JS_PATH = os.path.join(BASE_DIR, "js", "data.js")

# Caminho do Currículo (confirmado pelo usuário no diretório do projeto)
RESUME_PATH = os.path.join(BASE_DIR, "Erick_Silvestre_Curriculo_2.pdf")

# Configurações de E-mail (Placeholder)
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "seu-email@gmail.com"
