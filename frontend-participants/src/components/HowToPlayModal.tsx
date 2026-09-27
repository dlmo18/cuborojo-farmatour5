import { useState } from 'react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="setting-modal max-w-lg w-full py-10 ">
            {/* Header */}
            <div className="sticky top-0 px-8 pb-4 flex justify-between items-center">
                <h2 className="text-3xl font-bold text-black" style={{ fontFamily: "'Blinker', sans-serif" }}>
                ¿Cómo Jugar?
                </h2>
                <button
                onClick={onClose}
                className="text-black hover:text-gray-200 text-3xl leading-none"
                >
                ✕
                </button>
            </div>
            <div className='pb-4 bg-[#fff3df] rounded-3xl px-4'>
                <div className="setting-modal-body rounded-lg max-h-[80vh] pb-4 overflow-y-auto">

                    {/* Content */}
                    <div className="p-6 text-gray-700 space-y-4">
                        <p className="text-justify">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure 
                        dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                        </p>

                        <p className="text-justify">
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis 
                        unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
                        veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                        </p>

                        <p className="text-justify">
                        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione 
                        voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia 
                        non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
                        </p>

                        <p className="text-justify">
                        Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut quid ex ea commodi consequatur. 
                        Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum 
                        fugiat quo voluptas nulla pariatur.
                        </p>

                        <p className="text-justify">
                        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores 
                        et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, 
                        id est laborum et dolorum fuga.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4">
                        <button
                        onClick={onClose}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg transition"
                        style={{ fontFamily: "'Blinker', sans-serif" }}
                        >
                        Entendido
                        </button>
                    </div>
                </div> 
            </div>
        </div>
      </div>
    </>
  );
}
