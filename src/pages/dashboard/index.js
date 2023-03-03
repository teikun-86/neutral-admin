import Loader from "@/components/loader";
import AppLayout from "@/layouts/app";

const Dashboard = () => {
    return (
        <>
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">Dashboard</h2>

            <div className="w-full h-[60vh] rounded-lg border-4 border-dashed border-gray-600/80 dark:border-gray-300/60 my-5 grid place-items-center">
            </div>
            
        </>
    );
};

Dashboard.getLayout = page => <AppLayout permissions={['dashboard-read']} title="Dashboard">{page}</AppLayout>

export default Dashboard;