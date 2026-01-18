import google.generativeai as genai
import json
import os

# CONFIGURAÇÃO
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    try:
        from dotenv import load_dotenv
        load_dotenv()
        GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    except ImportError:
        pass

genai.configure(api_key=GOOGLE_API_KEY)

def generate_report(empresa, setor):
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f"""
    Como um especialista em tecnologia e recrutamento, pesquise e resuma a empresa {empresa} do setor {setor}.
    Foque no que a empresa faz e quais os desafios reais para um desenvolvedor BACKEND (tecnologias, escala, dados).
    
    Responda EXATAMENTE no formato JSON abaixo, sem blocos de código markdown, apenas o JSON:
    {{
        "summary": "Um resumo de 1 frase do que a empresa faz.",
        "details": "Um parágrafo explicando o modelo de negócio e os desafios de backend (Big Data, IoT, Escalabilidade, etc).",
        "bullets": ["Ponto 1", "Ponto 2", "Ponto 3"]
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        # Limpa possíveis blocos de código markdown da resposta
        text = response.text.strip().replace('```json', '').replace('```', '')
        return json.loads(text)
    except Exception as e:
        print(f"Erro ao processar {empresa}: {e}")
        return None

def main():
    # Caminho para o arquivo de dados
    data_path = 'js/data.js'
    
    # Simplesmente lê o conteúdo (considerando o formato export const contacts = [...])
    with open(data_path, 'r', encoding='utf-8') as f:
        content = f.read()
        json_str = content.split('=', 1)[1].strip().rstrip(';')
        contacts = json.loads(json_str)

    # Carrega relatórios existentes para não repetir
    reports_path = 'js/reports.js'
    if os.path.exists(reports_path):
        with open(reports_path, 'r', encoding='utf-8') as f:
            try:
                existing_content = f.read()
                existing_json = existing_content.split('=', 1)[1].strip().rstrip(';')
                reports = json.loads(existing_json)
            except:
                reports = {}
    else:
        reports = {}

    # Processa apenas empresas que ainda não tem relatório
    # Para testes, vamos processar apenas 5 por vez
    count = 0
    for c in contacts:
        cid = str(c['id'])
        if cid not in reports and count < 5:
            print(f"Gerando relatório para: {c['empresa']}...")
            report = generate_report(c['empresa'], c['setor'])
            if report:
                reports[cid] = report
                count += 1
    
    # Salva de volta
    with open(reports_path, 'w', encoding='utf-8') as f:
        f.write(f"export const reports = {json.dumps(reports, indent=4, ensure_ascii=False)};")
    
    print(f"\nSucesso! {count} novos relatórios gerados em js/reports.js")

if __name__ == "__main__":
    if GOOGLE_API_KEY == "SUA_CHAVE_AQUI":
        print("Erro: Por favor, configure sua GOOGLE_API_KEY no script.")
    else:
        main()
