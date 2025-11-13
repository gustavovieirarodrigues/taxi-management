import { useState } from 'react';
import ModalAgendamento from '../../components/ModalAgendamento';

const AgendamentoCategorias = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = [
    { id: 'vans', name: 'VANS', icon: '🚌' },
    { id: 'suvs', name: 'SUVs', icon: '🚙' },
    { id: 'blindados', name: 'BLINDADOS', icon: '🛡️' },
    { id: 'executivo', name: 'PADRÃO EXECUTIVO', icon: '🚗' },
  ];

  const handleSchedule = (categoryId) => {
    setSelectedCategory(categoryId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
  };

  return (
    <>
      <div className="category-title-pro">SELECIONE A CATEGORIA PARA AGENDAMENTO</div>

      <div className="vehicle-grid-pro">
        {categories.map((category) => (
          <div key={category.id} className="vehicle-card-pro">
            <div className="vehicle-image-pro">
              <div style={{ fontSize: '80px' }}>{category.icon}</div>
            </div>
            <div className="vehicle-name-pro">{category.name}</div>
            <button
              className="btn-schedule-pro"
              onClick={() => handleSchedule(category.id)}
            >
              AGENDAR
            </button>
          </div>
        ))}
      </div>

      <ModalAgendamento
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        category={selectedCategory}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default AgendamentoCategorias;
