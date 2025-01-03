const Card = ({ children, className = '' }) => (
    <div className={`bg-gray-800 rounded-lg shadow-lg ${className}`}>
      {children}
    </div>
  );
  
  const CardHeader = ({ children }) => (
    <div className="p-4 border-b border-gray-700">
      {children}
    </div>
  );
  
  const CardContent = ({ children }) => (
    <div className="p-4">
      {children}
    </div>
  );