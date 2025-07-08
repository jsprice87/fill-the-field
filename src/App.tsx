
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppWrapper } from "./components/AppWrapper";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWrapper />
    </QueryClientProvider>
  );
};

export default App;
