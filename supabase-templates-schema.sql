-- Criar tabela para projetos de templates virais
CREATE TABLE IF NOT EXISTS template_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  product_image_url TEXT NOT NULL,
  final_prompt TEXT NOT NULL,
  video_url TEXT,
  status VARCHAR(50) DEFAULT 'created' NOT NULL,
  veo3_request_id VARCHAR(100),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_template_projects_template_id ON template_projects(template_id);
CREATE INDEX IF NOT EXISTS idx_template_projects_status ON template_projects(status);
CREATE INDEX IF NOT EXISTS idx_template_projects_veo3_request_id ON template_projects(veo3_request_id);
CREATE INDEX IF NOT EXISTS idx_template_projects_created_at ON template_projects(created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_template_projects_updated_at 
BEFORE UPDATE ON template_projects 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE template_projects IS 'Projetos de vídeos gerados usando templates virais';
COMMENT ON COLUMN template_projects.template_id IS 'ID do template usado (hero-product, unboxing-reveal, etc.)';
COMMENT ON COLUMN template_projects.product_name IS 'Nome do produto fornecido pelo usuário';
COMMENT ON COLUMN template_projects.product_image_url IS 'URL da imagem do produto no Supabase Storage';
COMMENT ON COLUMN template_projects.final_prompt IS 'Prompt final enviado para VEO3 (com produto substituído)';
COMMENT ON COLUMN template_projects.video_url IS 'URL do vídeo gerado pelo VEO3';
COMMENT ON COLUMN template_projects.status IS 'Status: created, generating_video, generating_video_waiting, video_generated, error';
COMMENT ON COLUMN template_projects.veo3_request_id IS 'Request ID do VEO3 para polling/webhook';
