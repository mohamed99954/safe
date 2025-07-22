import { useState, useEffect } from "react";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DriverSidebar from "@/components/driver/DriverSidebar";
import { Star } from "lucide-react";
import { useDriverRatings } from "@/hooks/useDriverRatings";
import { format } from "date-fns";
import { toast } from "sonner";

const DriverRatingsContent = () => {
  const { t } = useLanguage();
  const { data: ratings, isLoading, error, refetch } = useDriverRatings();
  const [averageRating, setAverageRating] = useState(0);
  const [ratingStats, setRatingStats] = useState([0, 0, 0, 0, 0]);

  const handleRetry = () => {
    toast.info(t("loadingRatings"));
    refetch();
  };

  useEffect(() => {
    if (ratings && ratings.length > 0) {
      const avg =
        ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;
      setAverageRating(Number(avg.toFixed(1)));

      const stats = [0, 0, 0, 0, 0];
      ratings.forEach((rating) => {
        if (rating.rating >= 1 && rating.rating <= 5) {
          stats[rating.rating - 1]++;
        }
      });
      setRatingStats(stats);
    } else {
      setAverageRating(0);
      setRatingStats([0, 0, 0, 0, 0]);
    }
  }, [ratings]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DriverSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">{t("loading")}</div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Error loading ratings:", error);

    return (
      <div className="flex h-screen bg-gray-50">
        <DriverSidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-lg text-red-500 mb-4">
            {t("errorLoadingRatings")}
          </div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t("retryLoading")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">{t("ratings")}</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t("averageRating")}</span>
                  <div className="flex items-center">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold mr-2">
                      {averageRating}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = ratingStats[stars - 1];
                    const percentage =
                      ratings && ratings.length > 0
                        ? (count / ratings.length) * 100
                        : 0;

                    return (
                      <div key={stars} className="flex items-center">
                        <span className="ml-2 w-12 text-sm">
                          {stars} {t("stars")}
                        </span>
                        <div className="flex-1">
                          <div className="h-2 bg-gray-200 rounded">
                            <div
                              className="h-2 bg-yellow-400 rounded"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="mr-2 text-sm text-gray-500">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("latestRatings")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ratings && ratings.length > 0 ? (
                    ratings.map((rating) => (
                      <div
                        key={rating.id}
                        className="border-b border-gray-200 pb-4 last:border-0"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, starIndex) => (
                                <Star
                                  key={starIndex}
                                  className={`h-4 w-4 ${
                                    starIndex < rating.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-gray-200 text-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {rating.customer?.first_name}{" "}
                              {rating.customer?.last_name || t("customer")}
                            </p>
                            <p className="text-sm text-gray-600">
                              {t("order")} {rating.order_number}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {rating.created_at
                              ? format(
                                  new Date(rating.created_at),
                                  "dd/MM/yyyy"
                                )
                              : ""}
                          </span>
                        </div>
                        {rating.comment && (
                          <p className="text-gray-700">{rating.comment}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      {t("noRatingsYet")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

const DriverRatings = () => {
  return (
    <LanguageProvider>
      <DriverRatingsContent />
    </LanguageProvider>
  );
};

export default DriverRatings;
