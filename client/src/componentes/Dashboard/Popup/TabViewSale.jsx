import React, { useState } from "react";
import Loader from "../../Loader/Loader";

const TabViewSale = ({ isOpen, onClose, sale, loading }) => {
  if (!isOpen) {
    return null;
  }

  const primerVenta = sale[0] || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      {loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <Loader />
        </div>
      ) : (
        <div
          className={`flex flex-col md:flex-row mx-2 md:mx-8 md:h-4/5 h-full w-full overflow-y-scroll md:overflow-hidden bg-gray-200 md:w-4/5 rounded-lg`}
        >
          <div className="p-8 rounded-3xl w-full">
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="inline-flex items-center shrink-0 justify-center w-8 h-8 rounded-full bg-gray-900 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6 text-white hover:text-gray-300"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 shrink-0"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11"></path>
              </svg>
              <div className="space-y-0.5 flex-1">
                <h3 className="font-medium text-lg tracking-tight text-gray-900 leading-tight">
                  Información de ventas
                </h3>
                <p className="text-sm font-normal text-gray-400 leading-none">
                  Fecha {primerVenta?.fecha}
                </p>
              </div>
            </div>
            <div className="mt-9 relative flex flex-col gap-2.5">
              {sale &&
                sale.map((info, i) => (
                  <div key={i}>
                    <button className="w-full">
                      <div
                        className={`flex items-center space-x-4 p-3.5 bg-gray-100`}
                      >
                        <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-gray-100 text-gray-900">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                            />
                          </svg>
                        </span>
                        <div className="flex flex-col flex-1">
                          <h3 className="text-sm font-medium">
                            {info.productoNombre}
                          </h3>
                          <div className="divide-x divide-gray-200 mt-auto">
                            <span className="inline-block px-3 text-xs leading-none text-gray-400 font-normal first:pl-0">
                              {info.cantidad} cantidad
                            </span>
                            <span className="inline-block px-3 text-xs leading-none text-gray-400 font-normal first:pl-0">
                              ${info.total} total
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabViewSale;
