/**
 * ValidationProofViewer - Component to view proof (images, videos, URLs)
 */

"use client";

import { useState } from "react";
import type { PendingTaskExecution } from "@/types/validation.types";

interface ValidationProofViewerProps {
  task: PendingTaskExecution;
}

export default function ValidationProofViewer({ task }: ValidationProofViewerProps) {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  const proofItems = [
    ...(task.proof_urls || []),
    ...(task.proof_screenshots || []),
  ];

  const isVideo = (url: string) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url) || url.includes('video');
  };

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes('image');
  };

  if (proofItems.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aucune preuve soumise
        </p>
        {task.executant_notes && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg max-w-md mx-auto">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes de l'exécutant :</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{task.executant_notes}</p>
          </div>
        )}
      </div>
    );
  }

  const mainProof = selectedMedia || proofItems[0];

  return (
    <div className="space-y-4">
      {/* Main viewer */}
      <div className="aspect-video bg-gray-100 rounded-lg dark:bg-gray-900 flex items-center justify-center overflow-hidden">
        {isVideo(mainProof) ? (
          <video
            src={mainProof}
            controls
            className="w-full h-full object-contain"
            poster="/video-placeholder.png"
          >
            <track kind="captions" />
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        ) : isImage(mainProof) ? (
          <img
            src={mainProof}
            alt="Preuve soumise"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center p-8">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <a
              href={mainProof}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors inline-block"
            >
              Ouvrir le lien de preuve
            </a>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {proofItems.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {proofItems.map((proof, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedMedia(proof)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                selectedMedia === proof || (!selectedMedia && index === 0)
                  ? 'border-brand-500'
                  : 'border-gray-200 dark:border-gray-700 hover:border-brand-300'
              }`}
            >
              {isVideo(proof) ? (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              ) : isImage(proof) ? (
                <img
                  src={proof}
                  alt={`Preuve ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Executant notes */}
      {task.executant_notes && (
        <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Notes de l'exécutant
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {task.executant_notes}
          </p>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-2">
        <a
          href={mainProof}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 transition-colors"
        >
          Ouvrir dans un nouvel onglet
        </a>
        <a
          href={mainProof}
          download
          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 transition-colors"
        >
          Télécharger
        </a>
      </div>
    </div>
  );
}
