

const SalesByClientCard = ({ cliente }) => {
  return (
    <div className="w-full">
      <h1 className="text-centertext-md">{client.nombre}</h1>
      <div className="flex flex-col">
        {cliente.celular}
        <span>{cliente.totalSales}</span>
      </div>
    </div>
  );
};

export default SalesByClientCard;
