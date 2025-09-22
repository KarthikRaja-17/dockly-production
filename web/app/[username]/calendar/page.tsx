'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CalendarStepOne from '../../../pages/calendar/stepOne';
import CalendarStepTwo from '../../../pages/calendar/stepTwo';
import CalendarStepThree from '../../../pages/calendar/stepThree';
import CalendarStepFour from '../../../pages/calendar/stepFour';
import CalendarDashboard from '../../../pages/calendar/calendarDashboard';
import { getCalendarEvents } from '../../../services/google';
import DocklyLoader from '../../../utils/docklyLoader';
import moment from 'moment';
import axios from 'axios';
import { useGlobalLoading } from '../../loadingContext';

const Dashboard = () => {
  const [step, setStep] = useState<number>(1);
  const { setLoading } = useGlobalLoading();
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState({
    calendarEvents: true,
    reminders: true,
    recurringEvents: true,
  });
  const [connectedCalendars, setConnectedCalendars] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const calendarUser = localStorage.getItem('user');
    if (calendarUser) {
      setUser(calendarUser);
      setStep(4);
      localStorage.setItem('calendar', '1');
    }
  }, []);

  useEffect(() => {
    const username = localStorage.getItem('username') || '';
    if (localStorage.getItem('calendar') === null) {
      router.push(`/${username}/calendar/setup`);
    } else {
      fetchEvents(); // fetch only if already connected
    }
  }, []);

  const handleConnectMore = () => {
    setStep(1);
    setSelectedCalendars([]);
  };

  const onSelectDate = (date: any) => {
    const momentDate = moment(date.toDate ? date.toDate() : date);
    // setSelectedDate is missing in state, comment it or add it to state if needed
    // setSelectedDate(momentDate);
    if (connectedCalendars.includes('Google Calendar')) {
      const accessToken = localStorage.getItem('google_access_token');
      if (accessToken) {
        const startDate = momentDate.startOf('day');
        const endDate = momentDate.endOf('day');
        fetchGoogleCalendarEvents(accessToken, startDate, endDate);
      }
    }
  };

  useEffect(() => {
    const code = searchParams?.get('code');
    if (code && selectedCalendars.includes('Google Calendar')) {
      const exchangeToken = async () => {
        try {
          const response = await axios.post(
            'https://oauth2.googleapis.com/token',
            {
              code,
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
              redirect_uri: 'http://localhost:3000/dashboard',
              grant_type: 'authorization_code',
            }
          );

          const { access_token } = response.data;
          localStorage.setItem('google_access_token', access_token);
          setConnectedCalendars((prev) => [...prev, 'Google Calendar']);
          await fetchGoogleCalendarEvents(
            access_token,
            moment().startOf('day'),
            moment().endOf('day')
          );
          setStep(4);
          router.replace('/dashboard');
        } catch (error) {
          console.error('Error exchanging token:', error);
          alert('Failed to connect Google Calendar. Please try again.');
        }
      };

      exchangeToken();
    }

    if (step === 4) {
      const timer = setTimeout(() => setStep(5), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, step]);

  const fetchGoogleCalendarEvents = async (
    token: string,
    start: any,
    end: any
  ) => {
    try {
      const response = getCalendarEvents({
        token,
        start: start.toISOString(),
        end: end.toISOString(),
      });
      console.log(
        'Fetched Google Events:',
        (await response)?.data?.payload?.events || []
      );
    } catch (error) {
      console.error('Failed to fetch Google events:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getCalendarEvents({});
      const rawEvents = response?.data?.payload?.events;
      if (rawEvents) {
        localStorage.setItem('calendar', '1');
        setStep(5);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: '24px',
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        margin: '70px 50px',
      }}>
      {step === 1 && (
        <CalendarStepOne
          setStep={setStep}
          selectedCalendars={selectedCalendars}
          setSelectedCalendars={setSelectedCalendars}
        />
      )}
      {/* {step === 2 && (
        <CalendarStepTwo
          selectedCalendars={selectedCalendars}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
          setStep={setStep}
        />
      )} */}
      {step === 3 && (
        <CalendarStepThree
          setStep={setStep}
          selectedCalendars={selectedCalendars}
          setConnectedCalendars={setConnectedCalendars}
        />
      )}
      {step === 4 && <CalendarStepFour selectedCalendars={selectedCalendars} />}
      {step === 5 && (
        <CalendarDashboard handleConnectMore={handleConnectMore} />
      )}
    </div>
  );
};

export default Dashboard;
