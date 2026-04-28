import { ProductCard } from '../components/ProductCard';

async function getProducts() {
  try {
    const res = await fetch('http://localhost:3000/products?limit=50', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data?.filter((p: any) => p.visibleOnSite && p.status === 'ATIVO') ?? [];
  } catch {
    // Fallback mock para desenvolvimento
    return [
      { id:'1', sku:'AN-001', name:'Anel Solitário Ouro 18k',      material:'Ouro 18k', salePrice:3200, stock:3 },
      { id:'2', sku:'CO-001', name:'Colar Veneziana Ouro 18k 45cm', material:'Ouro 18k', salePrice:3800, stock:2 },
      { id:'3', sku:'BR-001', name:'Brinco Argola Ouro Rosé 18k',   material:'Ouro 18k', salePrice:1800, stock:8 },
      { id:'4', sku:'AL-001', name:'Aliança Conforto Ouro 18k 5mm', material:'Ouro 18k', salePrice:2800, stock:12 },
    ];
  }
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-yellow-900 mb-3">Joias Exclusivas em Ouro 18k</h1>
        <p className="text-gray-600 max-w-xl mx-auto">Peças artesanais únicas, criadas com os melhores materiais. Atendimento personalizado via WhatsApp.</p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
      </div>

      {products.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Catálogo em breve...</p>
        </div>
      )}
    </div>
  );
}
