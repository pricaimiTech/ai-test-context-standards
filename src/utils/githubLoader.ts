import axios from 'axios';
import chalk from 'chalk';
import { QAConfig } from '../config/defaultConfig.js';

export class GithubLoader {
  private config: QAConfig['standards'];
  private apiUrl: string; 
  private rawUrl: string;

  constructor(standardsConfig: QAConfig['standards']) {
    this.config = standardsConfig;
    this.config = standardsConfig;
    this.apiUrl = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents`;
    this.rawUrl = `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/${this.config.branch}`;
  }

  /**
   * Busca o manifesto onde está descrito todas as heurísticas disponíveis para decisão inteligente
   */
  async loadManifest(): Promise<any[]> {
    const folder = this.config.paths.heuristics;
    // Tenta buscar o manifest.json
    const url = `${this.rawUrl}/${folder}/manifest.json`;
    
    console.log(chalk.gray(`   🗂️  Lendo índice de inteligência (manifest.json)...`));

    try {
      const headers = this.config.githubToken 
        ? { 'Authorization': `token ${this.config.githubToken}` } 
        : {};

      const response = await axios.get(url, { headers });
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        // Fallback: Se o JSON estiver mal formatado ou for texto
        // Tenta parsear caso venha como string
        return typeof response.data === 'string' ? JSON.parse(response.data) : [];
      }
      
    } catch (error: any) {
      console.warn(chalk.yellow(`   ⚠️  Manifesto não encontrado. Listando arquivos manualmente...`));
      // Fallback para o método antigo de listar arquivos se o manifesto não existir
      const files = await this.listHeuristics();
      return files.map(f => ({
        id: f,
        name: f,
        description: "Heurística identificada automaticamente pelo nome do arquivo.",
        triggers: [f]
      }));
    }
  }

/**
 * @description Lista os arquivos disponíveis na pasta de heurísticas
 * @returns Lista de heurísticas disponíveis na pasta de heurísticas (nome dos arquivos .md)
 */
  async listHeuristics(): Promise<string[]> {
    const folder = this.config.paths.heuristics;
    const url = `${this.apiUrl}/${folder}?ref=${this.config.branch}`;
    console.log(chalk.gray(`   📂 Listando heurísticas em: ${folder}...`));

    try {
      const headers = this.config.githubToken 
        ? { 'Authorization': `token ${this.config.githubToken}` } 
        : {};

      const response = await axios.get(url, { headers });
      
      return response.data
        .filter((file: any) => file.name.endsWith('.md'))
        .map((file: any) => file.name.replace('.md', ''));
        
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Pasta não encontrada no GitHub: ${folder}`);
      }
      throw new Error(`Falha ao listar heurísticas: ${error.message}`);
    }
  }

 /**
  * @description Baixa o conteúdo de uma heurística
  * @param type - tipo de arquivo a ser carregado (heuristics, review, etc.)
  * @param name - nome do arquivo a ser carregado
  * @returns Conteúdo do arquivo carregado
  */
  async load(type: 'heuristics', name: string): Promise<string> {
    const folder = this.config.paths[type];
    const url = `${this.rawUrl}/${folder}/${name}.md`;
    
    try {
      const headers = this.config.githubToken 
        ? { 'Authorization': `token ${this.config.githubToken}` } 
        : {};
      const response = await axios.get(url, { headers });
      return response.data as string;
    } catch (error: any) {
      throw new Error(`Arquivo não encontrado: ${name}.md em ${folder}`);
    }
  }
}