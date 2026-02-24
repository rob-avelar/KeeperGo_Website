import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-blue-800">KeeperGo</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
          <p className="text-sm text-gray-500 mb-8">Última atualização: Fevereiro 2026</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introdução</h2>
              <p className="text-gray-700 leading-relaxed">
                A KeeperGo está comprometida em proteger a sua privacidade. Esta política descreve como 
                recolhemos, utilizamos e protegemos os seus dados pessoais em conformidade com o 
                Regulamento Geral sobre a Proteção de Dados (GDPR).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Responsável pelo Tratamento</h2>
              <p className="text-gray-700 leading-relaxed">
                A KeeperGo, com sede nos Países Baixos, é responsável pelo tratamento dos seus dados pessoais.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Dados Recolhidos</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-3">Recolhemos os seguintes dados:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Dados de identificação:</strong> Nome, endereço de email, número de telefone</li>
                  <li><strong>Dados de perfil:</strong> Foto, localização, experiência (para guarda-redes)</li>
                  <li><strong>Dados de pagamento:</strong> Processados de forma segura através do Stripe</li>
                  <li><strong>Dados de utilização:</strong> Histórico de reservas, avaliações, preferências</li>
                  <li><strong>Dados técnicos:</strong> Endereço IP, tipo de navegador, dispositivo</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Finalidades do Tratamento</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-3">Utilizamos os seus dados para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fornecer e gerir os serviços da plataforma</li>
                  <li>Processar pagamentos e transferências</li>
                  <li>Enviar notificações sobre reservas e partidas</li>
                  <li>Melhorar a experiência do utilizador</li>
                  <li>Cumprir obrigações legais</li>
                  <li>Prevenir fraudes e garantir a segurança</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Base Legal</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-3">O tratamento dos dados é baseado em:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Execução de contrato:</strong> Necessário para fornecer os serviços</li>
                  <li><strong>Consentimento:</strong> Para comunicações de marketing</li>
                  <li><strong>Interesse legítimo:</strong> Melhoria dos serviços e prevenção de fraude</li>
                  <li><strong>Obrigação legal:</strong> Cumprimento de requisitos fiscais e regulatórios</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Partilha de Dados</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-3">Podemos partilhar dados com:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Outros utilizadores:</strong> Nome e avaliações são visíveis na plataforma</li>
                  <li><strong>Processadores de pagamento:</strong> Stripe para processar transações</li>
                  <li><strong>Prestadores de serviços:</strong> Alojamento, análise, comunicações</li>
                  <li><strong>Autoridades:</strong> Quando exigido por lei</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Transferências Internacionais</h2>
              <p className="text-gray-700 leading-relaxed">
                Alguns dos nossos prestadores de serviços podem estar localizados fora do Espaço Económico 
                Europeu (EEE). Nestas situações, garantimos que existem salvaguardas adequadas, como 
                cláusulas contratuais padrão aprovadas pela Comissão Europeia.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Retenção de Dados</h2>
              <p className="text-gray-700 leading-relaxed">
                Mantemos os seus dados enquanto a sua conta estiver ativa ou conforme necessário para 
                lhe fornecer serviços. Dados de transações são mantidos por 7 anos para fins fiscais. 
                Pode solicitar a eliminação da sua conta a qualquer momento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Os Seus Direitos (GDPR)</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-3">Tem os seguintes direitos:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Acesso:</strong> Obter cópia dos seus dados pessoais</li>
                  <li><strong>Retificação:</strong> Corrigir dados inexatos ou incompletos</li>
                  <li><strong>Eliminação:</strong> Solicitar a eliminação dos seus dados</li>
                  <li><strong>Portabilidade:</strong> Receber os seus dados em formato estruturado</li>
                  <li><strong>Oposição:</strong> Opor-se ao tratamento em certas circunstâncias</li>
                  <li><strong>Limitação:</strong> Limitar o tratamento dos seus dados</li>
                  <li><strong>Retirar consentimento:</strong> A qualquer momento, sem afetar a licitude do tratamento anterior</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Segurança</h2>
              <p className="text-gray-700 leading-relaxed">
                Implementamos medidas técnicas e organizacionais apropriadas para proteger os seus dados, 
                incluindo encriptação, controlos de acesso e monitorização contínua. Os pagamentos são 
                processados de forma segura através do Stripe, certificado PCI DSS.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Utilizamos cookies essenciais para o funcionamento da plataforma e cookies de análise 
                para melhorar os nossos serviços. Pode gerir as suas preferências de cookies nas 
                definições do navegador.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Alterações a esta Política</h2>
              <p className="text-gray-700 leading-relaxed">
                Podemos atualizar esta política periodicamente. Notificaremos sobre alterações 
                significativas através da plataforma ou por email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contacto e Reclamações</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-3">
                  Para exercer os seus direitos ou questões sobre privacidade, contacte-nos:
                </p>
                <p className="mb-3">Email: privacy@keepergo.nl</p>
                <p>
                  Se não estiver satisfeito com a nossa resposta, pode apresentar uma reclamação à 
                  Autoridade Holandesa de Proteção de Dados (Autoriteit Persoonsgegevens).
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        <p>© 2026 KeeperGo. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
