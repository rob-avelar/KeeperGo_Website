import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Serviço</h1>
          <p className="text-sm text-gray-500 mb-8">Última atualização: Fevereiro 2026</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
              <p className="text-gray-700 leading-relaxed">
                Ao aceder e utilizar a plataforma KeeperGo, você concorda em cumprir e estar vinculado a estes 
                Termos de Serviço. Se não concordar com qualquer parte destes termos, não deve utilizar 
                os nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Descrição do Serviço</h2>
              <p className="text-gray-700 leading-relaxed">
                A KeeperGo é uma plataforma que conecta organizadores de partidas de futebol com guarda-redes 
                disponíveis para aluguer. Facilitamos a reserva, pagamento e gestão de serviços de guarda-redes 
                para partidas amadoras e recreativas na Holanda.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Tipos de Utilizadores</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-2"><strong>Organizadores:</strong> Utilizadores que criam partidas e contratam guarda-redes.</p>
                <p><strong>Guarda-redes:</strong> Utilizadores que oferecem os seus serviços como guarda-redes.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Registo e Conta</h2>
              <p className="text-gray-700 leading-relaxed">
                Para utilizar a plataforma, deve criar uma conta fornecendo informações precisas e completas. 
                É responsável por manter a confidencialidade da sua conta e senha. Deve ter pelo menos 
                18 anos para se registar.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Pagamentos e Comissões</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-2">O preço mínimo por hora é de €20.</p>
                <p className="mb-2">A plataforma retém uma comissão de 25% sobre cada transação.</p>
                <p className="mb-2">Os guarda-redes recebem 75% do valor total.</p>
                <p>Reservas diretas incluem um acréscimo de 25% ao preço base.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Política de Cancelamento</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-2"><strong>Organizadores:</strong> Cancelamento gratuito até 6 horas antes da partida. Após este período, podem aplicar-se penalizações.</p>
                <p><strong>Guarda-redes:</strong> Cancelamentos frequentes podem resultar em avisos e eventual bloqueio da conta.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Não Comparecimento (No-Show)</h2>
              <p className="text-gray-700 leading-relaxed">
                Se um guarda-redes não comparecer a uma partida confirmada, o organizador pode reportar 
                no prazo de 48 horas para reembolso total. O guarda-redes será bloqueado da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Avaliações</h2>
              <p className="text-gray-700 leading-relaxed">
                Os organizadores devem avaliar os guarda-redes após cada partida. As avaliações devem ser 
                honestas e baseadas na experiência real. Avaliações falsas ou manipuladas podem resultar 
                em suspensão da conta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Responsabilidades</h2>
              <p className="text-gray-700 leading-relaxed">
                A KeeperGo atua apenas como intermediária. Não somos responsáveis por lesões, acidentes 
                ou disputas que ocorram durante as partidas. Recomendamos que todos os participantes 
                tenham seguro adequado.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Propriedade Intelectual</h2>
              <p className="text-gray-700 leading-relaxed">
                Todo o conteúdo da plataforma, incluindo logotipos, design e software, é propriedade 
                da KeeperGo e está protegido por leis de propriedade intelectual.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Modificações dos Termos</h2>
              <p className="text-gray-700 leading-relaxed">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações 
                entram em vigor após publicação na plataforma. O uso continuado após modificações 
                constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Lei Aplicável</h2>
              <p className="text-gray-700 leading-relaxed">
                Estes termos são regidos pelas leis dos Países Baixos. Qualquer disputa será resolvida 
                nos tribunais competentes de Amesterdão.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contacto</h2>
              <p className="text-gray-700 leading-relaxed">
                Para questões sobre estes termos, contacte-nos através de: <br />
                Email: info@keepergo.nl
              </p>
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
