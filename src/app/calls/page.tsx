import React from 'react';
import { Phone, Video, Calendar, Clock, Users } from 'lucide-react';

const Calls = () => {
  const scheduledCalls = [
    {
      id: 1,
      title: 'Weekly Team Sync',
      type: 'video',
      time: '10:00 AM',
      date: 'Today',
      participants: ['Sarah Wilson', 'Mike Johnson', 'Emma Davis'],
    },
    {
      id: 2,
      title: 'Project Review',
      type: 'voice',
      time: '2:30 PM',
      date: 'Today',
      participants: ['John Doe', 'Alex Turner'],
    },
    {
      id: 3,
      title: 'Design Workshop',
      type: 'video',
      time: '11:00 AM',
      date: 'Tomorrow',
      participants: ['Sarah Wilson', 'Lisa Brown', 'Chris Evans'],
    },
  ];

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Calls</h1>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90">
              <Phone className="h-5 w-5" />
              <span>Start Call</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              <Video className="h-5 w-5" />
              <span>Start Meeting</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Scheduled Calls</h2>
            </div>
            <div className="divide-y">
              {scheduledCalls.map((call) => (
                <div key={call.id} className="p-4 hover:bg-secondary/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {call.type === 'video' ? (
                        <Video className="h-5 w-5" />
                      ) : (
                        <Phone className="h-5 w-5" />
                      )}
                      <div>
                        <h3 className="font-medium">{call.title}</h3>
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {call.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {call.time}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {call.participants.length} participants
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calls;