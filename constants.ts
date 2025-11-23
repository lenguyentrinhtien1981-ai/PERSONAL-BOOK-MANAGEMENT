import { Book, BookStatus } from './types';

export const INITIAL_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Đắc Nhân Tâm',
    author: 'Dale Carnegie',
    coverUrl: 'https://scontent.fdad3-5.fna.fbcdn.net/v/t39.30808-6/588713874_25395006386800233_4559458665274093338_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=127cfc&_nc_ohc=rUIz2R3vE0EQ7kNvwFmfGub&_nc_oc=AdmQOWjP4uAbpjfSt4O09-qi1MGHGRG8BO1VPgTLmr4jp3sKSamEQjdBh2SuKU4YCnI&_nc_zt=23&_nc_ht=scontent.fdad3-5.fna&_nc_gid=CLCG4-ZX6xSF65Qnpokj1w&oh=00_Afh-NfKUxN7h22_vX4aeoP82G_GL935BDpHPRl-W4zV43Q&oe=6927C23C',
    status: BookStatus.Reading,
    addedDate: Date.now() - 100000000,
    genre: 'Phát triển bản thân',
    notes: 'Nghệ thuật thu phục lòng người. Cuốn sách hay nhất mọi thời đại đưa bạn đến thành công.',
    currentPage: 45,
    totalPages: 320,
    isFavorite: true
  },
  {
    id: '2',
    title: 'Modern Spaces',
    author: 'Francisco Spencer',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=450',
    status: BookStatus.Finished,
    addedDate: Date.now() - 500000000,
    genre: 'Thiết kế',
    notes: 'Nguồn cảm hứng tuyệt vời cho thiết kế nội thất.',
    currentPage: 320,
    totalPages: 320,
    isFavorite: false
  },
  {
    id: '3',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300&h=450',
    status: BookStatus.ToRead,
    addedDate: Date.now(),
    genre: 'Phát triển bản thân',
    currentPage: 0,
    totalPages: 300,
    isFavorite: false
  }
];