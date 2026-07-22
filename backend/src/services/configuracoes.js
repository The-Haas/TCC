const db = require('../config');

async function getConfiguracoes() {
  try {
    // Busca a primeira (e única) linha da tabela
    const result = await db.query(`SELECT * FROM configuracoes ORDER BY id ASC LIMIT 1`);
    
    // Se por acaso a tabela estiver vazia, retorna null
    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    throw new Error("Não foi possível carregar as configurações do sistema.");
  }
}

async function updateConfiguracoes(dados) {
  try {
    // Primeiro, garantimos que existe uma linha para atualizar.
    // Puxamos pelo ID 1 ou a primeira que existir.
    let configAtual = await getConfiguracoes();
    
    if (!configAtual) {
      throw new Error("Nenhuma configuração encontrada no banco para atualizar.");
    }

    const camposPermitidos = [
      'smtp_host', 
      'smtp_port', 
      'smtp_user', 
      'smtp_pass', 
      'smtp_secure'
    ];

    let updates = [];
    let values = [];
    let i = 1;

    // Varre os campos permitidos e verifica se eles vieram no objeto 'dados'
    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        updates.push(`${campo} = $${i}`);
        values.push(dados[campo]);
        i++;
      }
    }

    if (updates.length === 0) {
      throw new Error("Nenhum dado válido foi enviado para atualização.");
    }

    // Atualiza o timestamp automaticamente
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Adiciona o ID da configuração no final do array de valores para a cláusula WHERE
    values.push(configAtual.id);

    const query = `
      UPDATE configuracoes 
      SET ${updates.join(', ')} 
      WHERE id = $${i} 
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];

  } catch (error) {
    console.error("Erro ao atualizar configurações:", error);
    throw error;
  }
}

module.exports = {
  getConfiguracoes,
  updateConfiguracoes
};