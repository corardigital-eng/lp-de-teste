import React from 'react';
import { StickyHeader } from './components/StickyHeader';
import { Button } from './components/Button';
import { 
  AlertCircle, 
  Activity, 
  MapPin, 
  Wind, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  Brain, 
  Star, 
  Heart,
  Smile,
  ArrowRight
} from 'lucide-react';

export default function App() {

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 antialiased overflow-x-hidden">
      <StickyHeader />

      {/* SEÇÃO 1: HERO - Headline Forte */}
      <section className="relative min-h-screen flex items-center pt-20 bg-brand-dark text-white overflow-hidden">
        {/* Background Overlay/Image Placeholder */}
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://picsum.photos/1920/1080?grayscale&blur=2')] bg-cover bg-center"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-brand-dark/90 via-brand-dark/80 to-brand-dark"></div>
        
        <div className="container mx-auto px-4 z-10 relative flex flex-col items-center text-center max-w-4xl">
          <span className="mb-4 inline-block px-4 py-1.5 rounded-full bg-brand-primary/20 text-teal-300 text-sm font-semibold tracking-wide border border-brand-primary/30">
            TERAPIA DE REPROCESSAMENTO GENERATIVO
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            Você não precisa viver fugindo da próxima crise.
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 font-light mb-8 max-w-3xl leading-relaxed">
            Libere o medo, retome o controle e volte a sentir paz no seu próprio corpo.
          </p>
          
          <div className="bg-white/5 backdrop-blur-sm border-l-4 border-brand-primary p-6 rounded-r-lg mb-10 text-left w-full max-w-2xl mx-auto">
            <p className="text-slate-200 text-lg">
              A Terapia de Reprocessamento Generativo (TRG) te ajuda a entender e dissolver a raiz emocional da ansiedade e do pânico — de forma segura, profunda e transformadora.
            </p>
          </div>

          <Button onClick={scrollToContact} className="transform hover:scale-105 transition-transform">
            Quero Agendar Minha Sessão Agora
          </Button>
          
          <div className="mt-12 flex flex-col md:flex-row items-center gap-6 opacity-70 text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <span>Ambiente Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-teal-400" />
              <span>Resultados Rápidos</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-teal-400" />
              <span>Método Científico</span>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: IDENTIFICAÇÃO / PROBLEMA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">
              O pânico não é loucura. <br/><span className="text-brand-primary">É um pedido de ajuda do seu emocional.</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Talvez você esteja vivendo isso há meses… ou anos. A sensação de estar perdendo o controle é aterrorizante, mas é um sintoma, não o fim.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
                <div className="absolute -inset-4 bg-red-50 rounded-full blur-2xl opacity-50"></div>
                <img 
                  src="https://picsum.photos/600/800?grayscale" 
                  alt="Pessoa reflexiva" 
                  className="relative rounded-2xl shadow-2xl z-10 w-full h-auto object-cover max-h-[500px]"
                />
            </div>
            
            <div className="order-1 md:order-2 space-y-6">
              <h3 className="text-xl font-bold text-brand-dark mb-6 border-b pb-4">Você sente algum destes sintomas?</h3>
              
              <ul className="space-y-4">
                {[
                  { icon: AlertCircle, text: "Sensação de que “vai morrer” do nada" },
                  { icon: Activity, text: "Coração acelerado sem motivo" },
                  { icon: MapPin, text: "Medo de sair de casa ou de ter uma crise em público" },
                  { icon: Wind, text: "Falta de ar, tremores, tontura, formigamento" },
                  { icon: Zap, text: "Pensamentos acelerados e sem controle" },
                  { icon: AlertCircle, text: "Medo constante da próxima crise" },
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="mt-1 bg-red-100 text-red-600 p-1.5 rounded-full shrink-0">
                      <item.icon size={18} />
                    </div>
                    <span className="text-slate-700 font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 bg-slate-50 border border-slate-200 p-5 rounded-lg">
                <p className="font-semibold text-brand-dark">
                  A verdade é que a síndrome do pânico não some sozinha.
                  <span className="block mt-2 text-brand-primary">Mas você não precisa conviver com ela.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: SOLUÇÃO / PROMESSA */}
      <section className="py-20 bg-brand-light">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-12 gap-10">
            <div className="md:col-span-7">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-6">
                Existe um caminho para libertar sua mente dos gatilhos emocionais que geram o pânico.
              </h2>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                Com a <span className="font-bold text-brand-primary">TRG (Terapia de Reprocessamento Generativo)</span> e a <span className="font-bold text-brand-primary">Leitura Corporal</span>, é possível identificar o que seu corpo tenta comunicar, acessar memórias emocionais bloqueadas e reprogramar sua resposta interna ao medo.
              </p>
              <p className="text-slate-700 mb-8">
                Não tratamos apenas o sintoma, vamos na raiz do problema.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Menos crises",
                  "Mais tranquilidade",
                  "Mais controle emocional",
                  "Menos sintomas físicos",
                  "Mais presença",
                  "Uma vida sem medo do medo"
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-600 w-5 h-5 shrink-0" />
                    <span className="font-medium text-slate-800">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-5 flex items-center justify-center">
              <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-brand-primary w-full">
                <h3 className="text-xl font-bold text-center mb-6 text-brand-dark">O Resultado?</h3>
                <div className="space-y-4">
                  <div className="bg-brand-light p-4 rounded-lg flex items-center gap-3">
                    <Smile className="text-brand-primary w-8 h-8" />
                    <div>
                      <p className="font-bold text-brand-dark">Alívio Imediato</p>
                      <p className="text-xs text-slate-500">Sentimento de peso tirado das costas</p>
                    </div>
                  </div>
                  <div className="bg-brand-light p-4 rounded-lg flex items-center gap-3">
                    <Brain className="text-brand-primary w-8 h-8" />
                    <div>
                      <p className="font-bold text-brand-dark">Reestruturação</p>
                      <p className="text-xs text-slate-500">Mudança na forma de pensar e sentir</p>
                    </div>
                  </div>
                  <Button fullWidth onClick={scrollToContact}>Quero esse resultado</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4: QUEM SOU */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/3">
              <div className="relative">
                 <div className="absolute inset-0 bg-brand-primary/10 rounded-2xl transform rotate-3"></div>
                 <img 
                   src="https://i.postimg.cc/kG2mrbh9/Gemini-Generated-Image-clny0hclny0hclny.png" 
                   alt="Elaine Corrêa Terapeuta" 
                   className="relative rounded-2xl shadow-lg w-full object-cover transform -rotate-2 hover:rotate-0 transition-transform duration-500"
                 />
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <h4 className="text-brand-primary font-bold uppercase tracking-wider text-sm mb-2">Terapeuta Integrativa Emocional</h4>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-6">Prazer, eu sou a Elaine Corrêa.</h2>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                Sou Terapeuta Integrativa Emocional, especializada em <strong>Terapia de Reprocessamento Generativo – TRG (CITRG 09.377)</strong> e certificada em Leitura Corporal pelo IBFT e pelo Instituto Brasileiro de Terapia de Reprocessamento Generativo.
              </p>
              
              <p className="text-slate-600 mb-8 leading-relaxed">
                Minha missão é ajudar você a entender a origem emocional dos seus sintomas, libertar bloqueios internos e reconstruir uma vida equilibrada — com segurança, acolhimento e total respeito ao seu tempo emocional.
              </p>
              
              <div className="flex items-center gap-4 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <div className="flex text-amber-500">
                  <Star fill="currentColor" size={20} />
                  <Star fill="currentColor" size={20} />
                  <Star fill="currentColor" size={20} />
                  <Star fill="currentColor" size={20} />
                  <Star fill="currentColor" size={20} />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  <span className="font-bold">Nota 5 no Google</span> por pacientes que transformaram sua relação com a ansiedade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 5: COMO FUNCIONA */}
      <section className="py-20 bg-brand-dark text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona o Processo Terapêutico</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Um método estruturado para garantir sua evolução a cada sessão.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Acolhimento e escuta",
                desc: "Entendo seus sintomas, histórico emocional e gatilhos em uma sessão de escuta profunda."
              },
              {
                step: "02",
                title: "Identificação da raiz",
                desc: "Por meio da TRG e da leitura corporal, acessamos o que seu corpo está tentando comunicar."
              },
              {
                step: "03",
                title: "Reprocessamento",
                desc: "Técnicas integrativas que desbloqueiam conflitos internos e reduzem sintomas de pânico."
              },
              {
                step: "04",
                title: "Estabilização",
                desc: "Você aprende a se reconectar consigo, recuperar o controle e reconstruir segurança interna."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-800 p-6 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700 relative overflow-hidden group">
                <span className="absolute -top-4 -right-4 text-9xl font-bold text-white/5 group-hover:text-white/10 transition-colors pointer-events-none">
                  {item.step}
                </span>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center mb-6 font-bold text-xl">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 6: BENEFÍCIOS CLAROS */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-brand-dark mb-12">O que você ganha ao iniciar o tratamento</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Redução significativa das crises",
              "Diminuição dos sintomas físicos",
              "Mais estabilidade emocional",
              "Aumento da sensação de segurança",
              "Clareza mental e autocontrole",
              "Melhoria da qualidade de vida",
              "Retomada da rotina sem medo"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <CheckCircle2 size={20} />
                </div>
                <span className="font-semibold text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 7: PROVA SOCIAL */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-dark mb-4">O que meus pacientes dizem</h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl font-bold text-brand-dark">5.0</span>
              <div className="flex text-amber-500">
                <Star fill="currentColor" />
                <Star fill="currentColor" />
                <Star fill="currentColor" />
                <Star fill="currentColor" />
                <Star fill="currentColor" />
              </div>
            </div>
            <p className="text-slate-600">Avaliação Geral no Google</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              "Voltei a sair de casa sem medo.",
              "Minhas crises diminuíram muito rápido.",
              "Elaine me trouxe paz quando eu não via saída.",
              "A melhor terapeuta que já tive, humana e profunda."
            ].map((quote, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative">
                <div className="absolute top-4 left-6 text-6xl text-brand-primary/20 font-serif leading-none">“</div>
                <p className="text-lg text-slate-700 italic relative z-10 pt-4 pl-4">{quote}</p>
                <div className="mt-4 pl-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                    P{idx + 1}
                  </div>
                  <span className="text-sm text-slate-400 font-medium">Paciente Verificado</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10 text-slate-500 italic">
            Atendimento acolhedor, ético e transformador.
          </div>
        </div>
      </section>

      {/* SEÇÃO 8: CTA FORTE */}
      <section id="contact" className="py-24 bg-brand-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Dê o próximo passo para uma vida sem pânico.
          </h2>
          <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
            O seu emocional está pedindo ajuda. <br/>
            Você não precisa enfrentar isso sozinha.
          </p>
          
          <div className="flex justify-center">
            <button 
              className="bg-white text-brand-primary font-extrabold text-lg px-10 py-5 rounded-full shadow-2xl hover:shadow-white/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
              onClick={() => alert('Abrir modal de agendamento ou redirecionar para WhatsApp')}
            >
              Agendar minha sessão agora
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO 9: GARANTIA EMOCIONAL */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 rounded-full text-brand-primary mb-6">
            <Heart size={32} />
          </div>
          <h3 className="text-2xl font-bold text-brand-dark mb-4">Acolhimento sem julgamentos. Terapia profunda sem pressão.</h3>
          <p className="text-slate-600 text-lg leading-relaxed">
            Cada sessão é conduzida com segurança e respeito, para que você avance no seu tempo — com suporte real e resultados consistentes.
          </p>
        </div>
      </section>

      {/* SEÇÃO 10: CTA FINAL / FOOTER */}
      <footer className="bg-brand-dark text-white pt-20 pb-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            Sua nova vida começa quando você decide cuidar de você.
          </h2>
          
          <div className="mb-12">
            <Button onClick={scrollToContact} variant="primary">
              Quero começar meu processo de cura
            </Button>
          </div>
          
          <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Elaine Corrêa. Todos os direitos reservados.</p>
            <p className="mt-2 md:mt-0">CITRG 09.377</p>
          </div>
        </div>
      </footer>
    </div>
  );
}