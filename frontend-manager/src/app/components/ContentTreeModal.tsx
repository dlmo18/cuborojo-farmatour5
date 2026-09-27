'use client';

import { useState, useEffect } from 'react';
import { MdClose, MdExpandMore, MdChevronRight } from 'react-icons/md';
import {
  levelsApi,
  missionsApi,
  questionsApi,
  Level,
  Mission,
  Question,
  LevelItem,
  MissionItem,
  LevelType,
} from '@/app/services/api';

interface ContentTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldId: string;
}

interface TreeNode {
  id: string;
  type: 'level' | 'mission' | 'question' | 'content' | 'item';
  label: string;
  icon: string;
  children?: TreeNode[];
  expanded?: boolean;
  levelType?: LevelType;
}

export default function ContentTreeModal({
  isOpen,
  onClose,
  worldId,
}: ContentTreeModalProps) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const getLevelIcon = (levelType: LevelType | undefined): string => {
    switch (levelType) {
      case 'golden':
        return '⭐';
      case 'final':
        return '🏁';
      default:
        return '📚';
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const buildTree = async () => {
    setLoading(true);
    setError('');
    try {
      // Obtener todos los niveles del mundo
      const levelsRes = await levelsApi.getByWorld(worldId);
      const levels = levelsRes.data;

      const levelNodes: TreeNode[] = await Promise.all(
        levels.map(async (level: Level) => {
          const children: TreeNode[] = [];

          try {
            // Obtener contenido del nivel (items)
            const itemsRes = await levelsApi.getItems(level.id);
            const items = itemsRes.data || [];
            
            for (const item of items) {
              children.push({
                id: `item-${item.id}`,
                type: 'item',
                label: item.title,
                icon: '📋',
                children: [],
              });
            }
          } catch (err) {
            console.error(`Error loading items for level ${level.id}:`, err);
          }

          // Obtener misiones del nivel
          try {
            const missionsRes = await missionsApi.getByLevel(level.id);
            const missions = missionsRes.data || [];

            for (const mission of missions) {
              const missionChildren: TreeNode[] = [];

              try {
                // Obtener items de la misión
                const missionItemsRes = await missionsApi.getItems(mission.id);
                const missionItems = missionItemsRes.data || [];
                
                for (const missionItem of missionItems) {
                  missionChildren.push({
                    id: `mission-item-${missionItem.id}`,
                    type: 'item',
                    label: missionItem.title,
                    icon: '📋',
                    children: [],
                  });
                }
              } catch (err) {
                console.error(`Error loading mission items for mission ${mission.id}:`, err);
              }

              // Obtener preguntas de la misión
              try {
                const questionsRes = await questionsApi.getByMissionAdmin(mission.id);
                const questions = questionsRes.data || [];
                
                for (const question of questions) {
                  missionChildren.push({
                    id: `question-${question.id}`,
                    type: 'question',
                    label: `${question.orderNum}. ${question.content.substring(0, 50)}${question.content.length > 50 ? '...' : ''}`,
                    icon: '❓',
                    children: [],
                  });
                }
              } catch (err) {
                console.error(`Error loading questions for mission ${mission.id}:`, err);
              }

              children.push({
                id: `mission-${mission.id}`,
                type: 'mission',
                label: mission.name,
                icon: '🎯',
                children: missionChildren,
              });
            }
          } catch (err) {
            console.error(`Error loading missions for level ${level.id}:`, err);
          }

          return {
            id: `level-${level.id}`,
            type: 'level',
            label: level.name,
            icon: getLevelIcon(level.levelType),
            levelType: level.levelType,
            children,
          };
        })
      );

      setTree(levelNodes);
    } catch (err: any) {
      console.error('Error building tree:', err);
      setError(err.message || 'Error al cargar el árbol de contenidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && worldId) {
      buildTree();
      // Expandir automáticamente los niveles al abrir el modal
      const levelIds = new Set<string>();
      // Los niveles se expandirán por defecto
      setExpandedNodes(new Set());
    }
  }, [isOpen, worldId]);

  const TreeNodeComponent = ({ node, depth = 0 }: { node: TreeNode; depth?: number }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 py-1 px-2 hover:bg-gray-100 rounded cursor-pointer transition-colors ${
            depth === 0 ? 'font-semibold text-gray-800' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleNode(node.id)}
              className="p-0 hover:bg-gray-200 rounded transition-colors"
              title={isExpanded ? 'Contraer' : 'Expandir'}
            >
              <MdChevronRight
                size={18}
                className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
          ) : (
            <span className="w-[18px]"></span>
          )}

          <span className="text-lg flex-shrink-0">{node.icon}</span>

          <span className="flex-1 truncate text-sm">{node.label}</span>

          {node.type === 'question' && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex-shrink-0">
              Pregunta
            </span>
          )}
          {node.type === 'mission' && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex-shrink-0">
              Misión
            </span>
          )}
          {node.type === 'level' && (
            <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
              node.levelType === 'golden'
                ? 'bg-yellow-100 text-yellow-700'
                : node.levelType === 'final'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
            }`}>
              {node.levelType === 'golden' ? 'Dorado' : node.levelType === 'final' ? 'Final' : 'Normal'}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => (
              <TreeNodeComponent key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h2 className="text-2xl text-black font-bold flex items-center gap-2">
            🌳 Árbol de Contenidos
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
              <p className="text-gray-600">Cargando árbol de contenidos...</p>
            </div>
          </div>
        ) : tree.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">No hay contenidos para mostrar</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-4">
            <div className="space-y-1">
              {tree.map((node) => (
                <TreeNodeComponent key={node.id} node={node} depth={0} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📚</span>
              <span className="text-gray-600">Nivel Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <span className="text-gray-600">Nivel Dorado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🏁</span>
              <span className="text-gray-600">Nivel Final</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span className="text-gray-600">Misión</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">❓</span>
              <span className="text-gray-600">Pregunta</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <span className="text-gray-600">Contenido</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
