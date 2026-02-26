function Dashboard({ user }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-light text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-500 mb-8">
          Welcome back, {user.displayName}
        </p>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm inline-block">
          <img 
            src={user.photoURL} 
            alt="Profile" 
            className="w-16 h-16 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-900 font-medium">{user.email}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
