import { useState } from "react";
import { doSignInWithEmailAndPassword } from "../../../firebase/auth";
import toast from "react-hot-toast";

export const FormLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      await doSignInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error("Error al ingresar:", error);
      toast.error("Error al ingresar. Verifica tus credenciales.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col text-center mt-6">
        <label htmlFor="email">Email</label>
        <input
          className="p-2 border border-gray-400 rounded-md"
          type="email"
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col text-center mt-6">
        <label htmlFor="password">Password</label>
        <input
          className="p-2 border border-gray-400 rounded-md"
          type="password"
          name="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="p-2 border mt-3 bg-secondary text-white rounded-full hover:bg-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
};
