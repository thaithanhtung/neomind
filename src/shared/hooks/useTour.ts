import { useCallback } from 'react';
import introJs from 'intro.js';

export type TourId = 'mindmap-list' | 'mindmap-detail';

export interface TourStep {
  element: string;
  intro: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  tooltipClass?: string;
}

interface TourConfig {
  steps: TourStep[];
  showProgress?: boolean;
  showBullets?: boolean;
  exitOnOverlayClick?: boolean;
  exitOnEsc?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  doneLabel?: string;
  skipLabel?: string;
}

const TOUR_STORAGE_KEY = 'neomind_tours_completed';

/**
 * Hook để quản lý tour hướng dẫn với intro.js
 */
export const useTour = (tourId: TourId) => {
  // Kiểm tra xem tour đã được hoàn thành chưa
  const isTourCompleted = useCallback(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) return false;
    try {
      const completedTours = JSON.parse(completed) as TourId[];
      return completedTours.includes(tourId);
    } catch {
      return false;
    }
  }, [tourId]);

  // Đánh dấu tour đã hoàn thành
  const markTourCompleted = useCallback(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    let completedTours: TourId[] = [];
    if (completed) {
      try {
        completedTours = JSON.parse(completed) as TourId[];
      } catch {
        completedTours = [];
      }
    }
    if (!completedTours.includes(tourId)) {
      completedTours.push(tourId);
      localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(completedTours));
    }
  }, [tourId]);

  // Bắt đầu tour
  const startTour = useCallback(
    (config: TourConfig) => {
      // Đợi một chút để đảm bảo DOM đã render
      setTimeout(() => {
        // Lọc các step có element tồn tại trong DOM
        const validSteps = config.steps.filter((step) => {
          try {
            const element = document.querySelector(step.element);
            return element !== null;
          } catch (error) {
            console.warn(`Tour step element not found: ${step.element}`, error);
            return false;
          }
        });

        // Nếu không có step nào hợp lệ, không start tour
        if (validSteps.length === 0) {
          console.warn('No valid tour steps found');
          alert(
            'Không tìm thấy các phần tử để hướng dẫn. Vui lòng thử lại sau.'
          );
          return;
        }

        const intro = introJs();

        intro.setOptions({
          steps: validSteps,
          showProgress: config.showProgress ?? true,
          showBullets: config.showBullets ?? true,
          exitOnOverlayClick: config.exitOnOverlayClick ?? true,
          exitOnEsc: config.exitOnEsc ?? true,
          prevLabel: config.prevLabel ?? 'Trước',
          nextLabel: config.nextLabel ?? 'Tiếp',
          doneLabel: config.doneLabel ?? 'Hoàn thành',
          skipLabel: config.skipLabel ?? 'Bỏ qua',
          tooltipClass: 'customTooltip',
          highlightClass: 'customHighlight',
        });

        intro.oncomplete(() => {
          markTourCompleted();
        });

        intro.onexit(() => {
          // Không đánh dấu completed khi exit, để user có thể xem lại
        });

        try {
          intro.start();
        } catch (error) {
          console.error('Error starting tour:', error);
          alert('Có lỗi xảy ra khi bắt đầu hướng dẫn. Vui lòng thử lại.');
        }
      }, 500);
    },
    [markTourCompleted]
  );

  // Reset tour (cho phép xem lại)
  const resetTour = useCallback(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) return;
    try {
      const completedTours = JSON.parse(completed) as TourId[];
      const filtered = completedTours.filter((id) => id !== tourId);
      localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // Ignore error
    }
  }, [tourId]);

  return {
    startTour,
    isTourCompleted,
    resetTour,
  };
};
