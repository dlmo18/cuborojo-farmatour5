'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  worldsApi,
  levelsApi,
  missionsApi,
  questionsApi,
  goldenLevelsApi,
  finalLevelsApi,
  mediaApi,
  Level,
  Mission,
  MissionItem,
  LevelItem,
  Question,
  GoldenLevelItem,
  GoldenLevelQuestion,
  GoldenLevelAnswerOption,
  FinalLevelQuestion,
  FinalLevelAnswerOption,
} from '@/app/services/api';

interface LevelData {
  level: Level;
  items: LevelItem[];
  missions: { mission: Mission; items: MissionItem[]; questions: Question[] }[];
  goldenItems: GoldenLevelItem[];
  goldenQuestions: (GoldenLevelQuestion & { options: GoldenLevelAnswerOption[] })[];
  finalQuestions: (FinalLevelQuestion & { options: FinalLevelAnswerOption[] })[];
}

const safe = async <T,>(p: Promise<{ data: T }>, fallback: T): Promise<T> => {
  try {
    return (await p).data ?? fallback;
  } catch (err) {
    console.error(err);
    return fallback;
  }
};

const Missing = ({ label }: { label: string }) => (
  <span className="text-red-600 text-xs font-semibold">⚠ Sin {label}</span>
);

const Thumb = ({ id, label = 'imagen' }: { id?: string; label?: string }) => {
  if (!id) return <Missing label={label} />;
  const url = mediaApi.getServeUrl(id);
  return (
    <div className="inline-block mr-3 mb-2 align-top">
      <img src={url} alt={label} style={{ width: 200 }} className="border rounded" />
      <a href={url} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-600 underline">
        Ver {label} en ventana nueva
      </a>
    </div>
  );
};

const VideoLink = ({ id, url, label }: { id?: string; url?: string; label: string }) => {
  const href = url || (id ? mediaApi.getServeUrl(id) : '');
  if (!href) return <Missing label={label} />;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline mr-4">
      ▶ Ver {label}
    </a>
  );
};

const Html = ({ html, label }: { html?: string; label: string }) =>
  html ? (
    <div className="prose prose-sm max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <Missing label={label} />
  );

const Field = ({ name, children }: { name: string; children: React.ReactNode }) => (
  <div className="mb-2">
    <div className="text-xs font-semibold uppercase text-gray-500">{name}</div>
    <div>{children}</div>
  </div>
);

const Options = ({ options }: { options: { id: string; text: string; imageId?: string; isCorrect: boolean; detail?: string }[] }) =>
  options.length === 0 ? (
    <Missing label="respuestas" />
  ) : (
    <ol className="list-[upper-alpha] pl-6 space-y-2">
      {options.map((o) => (
        <li key={o.id} className={o.isCorrect ? 'text-green-700' : 'text-gray-800'}>
          <span className="font-medium">{o.text}</span>{' '}
          <span className={`text-xs px-2 py-0.5 rounded-full ${o.isCorrect ? 'bg-green-100' : 'bg-gray-100 text-gray-600'}`}>
            {o.isCorrect ? '✔ Correcta' : '✘ Incorrecta'}
          </span>
          {o.detail && <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: o.detail }} />}
          {o.imageId && <div className="mt-1"><Thumb id={o.imageId} /></div>}
        </li>
      ))}
    </ol>
  );

const ContentCard = ({ item }: { item: MissionItem | LevelItem }) => {
  const mi = item as MissionItem;
  return (
    <div className="border rounded-lg p-4 mb-3 break-inside-avoid">
      <h5 className="font-semibold text-gray-900 mb-2">📋 {item.title}</h5>
      <Field name="Imagen">
        <Thumb id={item.imageId} />
        {item.thumbnailId && <Thumb id={item.thumbnailId} label="miniatura" />}
      </Field>
      <Field name="Beneficios"><Html html={item.benefits} label="beneficios" /></Field>
      <Field name="Contenidos">
        {mi.contentBadges?.length ? (
          <ul className="list-disc pl-6 text-sm">
            {mi.contentBadges.map((b: any, i: number) => <li key={i}>{b?.title ?? String(b)}</li>)}
          </ul>
        ) : null}
        <Html html={item.detail} label="contenidos" />
      </Field>
      {'variantBadges' in item && (
        <Field name="Variantes">
          {mi.variantBadges?.length ? (
            <ul className="list-disc pl-6 text-sm">
              {mi.variantBadges.map((v: any, i: number) => <li key={i}>{typeof v === 'string' ? v : v?.title}</li>)}
            </ul>
          ) : (
            <Missing label="variantes" />
          )}
        </Field>
      )}
    </div>
  );
};

const QuestionCard = ({ n, title, options, correct, incorrect, imageId, extra }: {
  n: number;
  title: string;
  options: any[];
  correct?: string;
  incorrect?: string;
  imageId?: string;
  extra?: React.ReactNode;
}) => (
  <div className="border border-blue-200 rounded-lg p-4 mb-3 break-inside-avoid">
    <h5 className="font-semibold text-gray-900 mb-2">❓ {n}. <span dangerouslySetInnerHTML={{ __html: title }} /></h5>
    {imageId && <Thumb id={imageId} />}
    {extra}
    <Field name="Respuestas"><Options options={options} /></Field>
    <Field name="Feedback correcto"><Html html={correct} label="feedback correcto" /></Field>
    <Field name="Feedback incorrecto"><Html html={incorrect} label="feedback incorrecto" /></Field>
  </div>
);

export default function ContentTreePage() {
  const { worldId } = useParams<{ worldId: string }>();
  const [worldName, setWorldName] = useState('');
  const [data, setData] = useState<LevelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [world, levels] = await Promise.all([
          safe(worldsApi.getById(worldId), null as any),
          (await levelsApi.getByWorld(worldId)).data,
        ]);
        setWorldName(world?.name ?? '');
        const sorted = [...levels].sort((a, b) => a.orderNum - b.orderNum);
        setData(
          await Promise.all(
            sorted.map(async (level): Promise<LevelData> => {
              const type = level.levelType ?? (level.isGolden ? 'golden' : 'normal');
              const d: LevelData = { level, items: [], missions: [], goldenItems: [], goldenQuestions: [], finalQuestions: [] };
              if (type === 'golden') {
                d.goldenItems = await safe(goldenLevelsApi.getItems(level.id), []);
                const qs = await safe(goldenLevelsApi.getQuestions(level.id), []);
                d.goldenQuestions = await Promise.all(
                  qs.map(async (q) => ({ ...q, options: await safe(goldenLevelsApi.getAnswers(q.id), []) })),
                );
              } else if (type === 'final') {
                const qs = await safe(finalLevelsApi.getQuestions(level.id), []);
                d.finalQuestions = await Promise.all(
                  qs.map(async (q) => ({ ...q, options: await safe(finalLevelsApi.getAnswers(q.id), []) })),
                );
              } else {
                d.items = await safe(levelsApi.getItems(level.id), []);
                const missions = await safe(missionsApi.getByLevel(level.id), []);
                d.missions = await Promise.all(
                  missions.map(async (mission) => ({
                    mission,
                    items: await safe(missionsApi.getItems(mission.id), []),
                    questions: await safe(questionsApi.getByMissionAdmin(mission.id), []),
                  })),
                );
              }
              return d;
            }),
          ),
        );
      } catch (err: any) {
        setError(err.message || 'Error al cargar el árbol de contenidos');
      } finally {
        setLoading(false);
      }
    })();
  }, [worldId]);

  const levelLabel = (l: Level) =>
    l.levelType === 'golden' || l.isGolden ? '⭐ Nivel Dorado' : l.levelType === 'final' ? '🏁 Nivel Final' : '📚 Nivel';

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <style>{`@media print { .no-print { display: none !important; } a { color: #2563eb; } }`}</style>
      <header className="no-print sticky top-0 bg-white border-b px-6 py-3 flex justify-between items-center z-10">
        <h1 className="text-xl font-bold">🌳 Árbol de Contenidos</h1>
        <button
          onClick={() => window.print()}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          Exportar PDF
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Mundo: {worldName}</h2>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
        {loading ? (
          <p className="text-gray-600">Cargando árbol de contenidos...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-500">No hay contenidos para mostrar</p>
        ) : (
          data.map(({ level, items, missions, goldenItems, goldenQuestions, finalQuestions }) => (
            <section key={level.id} className="mb-10">
              <h3 className="text-xl font-bold border-b-2 border-gray-800 pb-1 mb-3">
                {levelLabel(level)}: {level.name}
              </h3>
              {level.introVideoUrl || level.introVideoId ? (
                <Field name="Video introductorio">
                  <VideoLink id={level.introVideoId} url={level.introVideoUrl} label="video introductorio" />
                </Field>
              ) : null}

              {items.map((it) => <ContentCard key={it.id} item={it} />)}

              {missions.map(({ mission, items, questions }) => (
                <div key={mission.id} className="ml-4 mb-6">
                  <h4 className="text-lg font-semibold text-purple-800 mb-2">🎯 Misión: {mission.name}</h4>
                  {items.length === 0 && <div className="mb-2"><Missing label="contenidos" /></div>}
                  {items.map((it) => <ContentCard key={it.id} item={it} />)}
                  {questions.length === 0 && <Missing label="preguntas" />}
                  {questions.map((q, i) => {
                    const correctOpt = q.options?.find((o) => o.isCorrect);
                    return (
                      <QuestionCard
                        key={q.id}
                        n={q.orderNum ?? i + 1}
                        title={q.content}
                        imageId={q.imageId}
                        options={q.options ?? []}
                        // En la app de participantes: correcto muestra la opción correcta; incorrecto muestra el sustento (benefit)
                        correct={correctOpt ? correctOpt.detail || correctOpt.text : undefined}
                        incorrect={q.benefit}
                      />
                    );
                  })}
                </div>
              ))}

              {goldenItems.map((it) => (
                <div key={it.id} className="border rounded-lg p-4 mb-3 break-inside-avoid">
                  <h5 className="font-semibold mb-2">📋 {it.title}</h5>
                  <Html html={it.detail} label="contenido" />
                </div>
              ))}
              {goldenQuestions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  n={q.orderNum ?? i + 1}
                  title={q.title ? `${q.title} — ${q.content}` : q.content}
                  options={q.options}
                />
              ))}

              {finalQuestions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  n={q.orderNum ?? i + 1}
                  title={q.content}
                  options={q.options}
                  correct={q.correctMessage}
                  incorrect={q.incorrectMessage}
                  extra={
                    <Field name="Videos">
                      <VideoLink id={q.startVideoId} url={q.startVideoUrl} label="video de inicio" />
                      <VideoLink id={q.endVideoId} url={q.endVideoUrl} label="video de cierre" />
                    </Field>
                  }
                />
              ))}
            </section>
          ))
        )}
      </main>
    </div>
  );
}
