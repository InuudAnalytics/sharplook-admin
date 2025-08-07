// Type definitions
export interface DisputeUser {
  name: string;
  email: string;
  avatar: string | null;
}

export interface Dispute {
  user: DisputeUser;
  date: string;
  complaint: string;
  status: "Resolved" | "Unresolved";
  type: "Vendor" | "Client";
  picture?: string; // Optional picture field
  evidence?: string; // Optional evidence field (array of URLs)
}

const disputeData: Dispute[] = [
  {
    user: {
      name: "Mhdiv Store",
      email: "dianneneash@gmail.com",
      avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    },
    date: "03/11/24",
    complaint:
      "Lorem ipsum dolor sit amet, r adipiscing elit, sed do eiusmod tempor.",
    status: "Resolved",
    type: "Vendor",
    picture: "https://via.placeholder.com/200x200?text=Sample+Image", // Sample image
    evidence:
      "https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg",
  },
  {
    user: {
      name: "Praya Store",
      email: "zachi565@gmail.com",
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    },
    date: "03/11/24",
    complaint:
      "Lorem ipsum dolor sit amet, r adipiscing elit, sed do eiusmod tempor.",
    status: "Unresolved",
    type: "Vendor",
    picture: "https://via.placeholder.com/200x200?text=Sample+Image+2", // Sample image
    evidence:
      "https://images.pexels.com/photos/5240820/pexels-photo-5240820.jpeg",
  },
  {
    user: {
      name: "Heritage Spa and Beauty",
      email: "vokeonoriode@gmail.com",
      avatar: "https://randomuser.me/api/portraits/men/13.jpg",
    },
    date: "03/11/24",
    complaint:
      "Lorem ipsum dolor sit amet, r adipiscing elit, sed do eiusmod tempor.",
    status: "Resolved",
    type: "Vendor",
    // No evidence for this one
    evidence:
      "https://images.pexels.com/photos/3183199/pexels-photo-3183199.jpeg",
  },
  {
    user: {
      name: "Praya Store",
      email: "zachi565@gmail.com",
      avatar: null,
    },
    date: "03/11/24",
    complaint:
      "Lorem ipsum dolor sit amet, r adipiscing elit, sed do eiusmod tempor.",
    status: "Unresolved",
    type: "Vendor",
    evidence:
      "https://images.pexels.com/photos/3183200/pexels-photo-3183200.jpeg",
  },
  {
    user: {
      name: "Heritage Spa and Beauty",
      email: "vokeonoriode@gmail.com",
      avatar: null,
    },
    date: "03/11/24",
    complaint:
      "Lorem ipsum dolor sit amet, r adipiscing elit, sed do eiusmod tempor.",
    status: "Resolved",
    type: "Vendor",
    evidence:
      "https://images.pexels.com/photos/3183201/pexels-photo-3183201.jpeg",
  },
  {
    user: {
      name: "Cameron Williamson",
      email: "dianneneash@gmail.com",
      avatar: "https://randomuser.me/api/portraits/men/14.jpg",
    },
    date: "03/11/24",
    complaint:
      "Lorem ipsum dolor sit amet, r adipiscing elit, sed do eiusmod tempor.",
    status: "Unresolved",
    type: "Vendor",
    evidence:
      "https://images.pexels.com/photos/3183202/pexels-photo-3183202.jpeg",
  },
  {
    user: {
      name: "Guy Hawkins",
      email: "dianneneash@gmail.com",
      avatar: null,
    },
    date: "03/11/24",
    complaint:
      "Lorem ipsum dolor sit amet, r adipiscing elit, sed do eiusmod tempor.",
    status: "Resolved",
    type: "Vendor",
    evidence:
      "https://images.pexels.com/photos/3992868/pexels-photo-3992868.jpeg",
  },
  {
    user: {
      name: "Ronald Richards",
      email: "dianneneash@gmail.com",
      avatar: null,
    },
    date: "03/11/24",
    complaint:
      "Lorem ipsum dolor sit amet, r adipiscing elit, sed do eiusmod tempor.",
    status: "Unresolved",
    type: "Vendor",
    evidence:
      "https://images.pexels.com/photos/3183204/pexels-photo-3183204.jpeg",
  },
  {
    user: {
      name: "Leslie Alexander",
      email: "dianneneash@gmail.com",
      avatar: "https://randomuser.me/api/portraits/women/15.jpg",
    },
    date: "03/11/24",
    complaint:
      "Lorem ipsum dolor sit amet, r adipiscing elit, sed do eiusmod tempor.",
    status: "Resolved",
    type: "Vendor",
    evidence:
      "https://images.pexels.com/photos/7984976/pexels-photo-7984976.jpeg",
  },
  {
    user: {
      name: "Kathryn Murphy",
      email: "dianneneash@gmail.com",
      avatar: "https://randomuser.me/api/portraits/women/16.jpg",
    },
    date: "03/11/24",
    complaint:
      "Lorem ipsum dolor sit amet, r adipiscing elit, sed do eiusmod tempor.",
    status: "Unresolved",
    type: "Vendor",
    evidence:
      "https://images.pexels.com/photos/3183206/pexels-photo-3183206.jpeg",
  },
  // Add more for pagination
  ...Array.from(
    { length: 20 },
    (_, i) =>
      ({
        user: {
          name: `Vendor User ${i + 1}`,
          email: `vendor${i + 1}@example.com`,
          avatar: null,
        },
        date: "03/11/24",
        complaint:
          "Lorem ipsum dolor sit amet, r adipiscing elit, sed do eiusmod tempor.",
        status: i % 2 === 0 ? "Resolved" : "Unresolved",
        type: "Vendor",
      } as const)
  ),
  ...Array.from({ length: 10 }, (_, i) => {
    // Realistic client data
    const clientList = [
      {
        name: "Emily Carter",
        email: "emily.carter@gmail.com",
        avatar: "https://randomuser.me/api/portraits/women/21.jpg",
      },
      {
        name: "Michael Johnson",
        email: "michael.johnson@yahoo.com",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      },
      {
        name: "Sophia Lee",
        email: "sophia.lee@hotmail.com",
        avatar: "https://randomuser.me/api/portraits/women/23.jpg",
      },
      {
        name: "James Smith",
        email: "james.smith@gmail.com",
        avatar: "https://randomuser.me/api/portraits/men/24.jpg",
      },
      {
        name: "Olivia Brown",
        email: "olivia.brown@gmail.com",
        avatar: "https://randomuser.me/api/portraits/women/25.jpg",
      },
      {
        name: "William Davis",
        email: "william.davis@gmail.com",
        avatar: "https://randomuser.me/api/portraits/men/26.jpg",
      },
      {
        name: "Ava Wilson",
        email: "ava.wilson@gmail.com",
        avatar: "https://randomuser.me/api/portraits/women/27.jpg",
      },
      {
        name: "Benjamin Martinez",
        email: "benjamin.martinez@gmail.com",
        avatar: "https://randomuser.me/api/portraits/men/28.jpg",
      },
      {
        name: "Mia Anderson",
        email: "mia.anderson@gmail.com",
        avatar: "https://randomuser.me/api/portraits/women/29.jpg",
      },
      {
        name: "Elijah Thomas",
        email: "elijah.thomas@gmail.com",
        avatar: "https://randomuser.me/api/portraits/men/30.jpg",
      },
    ];
    const client = clientList[i % clientList.length];
    return {
      user: client,
      date: "03/11/24",
      complaint:
        "Lorem ipsum dolor sit amet, r adipiscing elit, sed do eiusmod tempor.",
      status: i % 2 === 0 ? "Resolved" : "Unresolved",
      type: "Client",
    } as const;
  }),
];

export default disputeData;
