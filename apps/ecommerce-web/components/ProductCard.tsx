'use client';

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5581999999999';

function whatsappLink(product: any) {
  const msg = `Olá! Tenho interesse na joia:

*${product.name}*
SKU: ${product.sku}
Material: ${product.material ?? 'Ouro 18k'}
Preço: R$ ${Number(product.salePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

Poderia me dar mais informações?`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export function ProductCard({ product }: { product: any }) {
  const inStock = product.stock > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Imagem placeholder */}
      <div className="h-52 bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
        <span className="text-6xl">💍</span>
      </div>

      <div className="p-5">
        <div className="text-xs text-gray-400 font-mono mb-1">{product.sku}</div>
        <h3 className="font-semibold text-gray-800 mb-1 leading-snug">{product.name}</h3>
        {product.material && <p className="text-xs text-yellow-700 mb-3">{product.material}</p>}

        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-yellow-900">
            R$ {Number(product.salePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${inStock ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {inStock ? 'Disponível' : 'Indisponível'}
          </span>
        </div>

        {inStock ? (
          <a href={whatsappLink(product)} target="_blank" rel="noopener noreferrer"
            className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2.5 rounded-xl text-sm font-medium transition-colors">
            💬 Tenho Interesse
          </a>
        ) : (
          <button disabled className="block w-full bg-gray-100 text-gray-400 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed">
            Indisponível
          </button>
        )}
      </div>
    </div>
  );
}
