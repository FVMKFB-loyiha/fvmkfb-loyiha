

/////  Foydalanuvchi qo'shish

INSERT INTO users (fullname, role, email, birth_date, picture, file, department, position, phone, "createdAt", "updatedAt")
VALUES 
(
  'Super Admin', 
  'admin', 
  'superadmin', 
  '1980-01-01', 
  '', 
  NULL, 
  'IT', 
  'Administrator', 
  '1234567890',
  NOW(),
  NOW()
);


INSERT INTO users (fullname, role, email, birth_date, picture, file, department, position, phone, edu, "createdAt", "updatedAt")
VALUES 
(
  'Abduraxmon Bozorov', 
  'admin', 
  'abduraxmon@gmail.com', 
  '1999-05-15', 
  '', 
  NULL, 
  'AKT', 
  'Bolim boshligi', 
  '998905305053',
  [{'edu_name':'Toshkent axborot texnologiyalari University','study_year':'2018-2022','degree':'Bakalavr','specialty':'Kompyuter injiner'}]
  NOW(),
  NOW()
);


/////  Rasmni default qilish

ALTER TABLE users ALTER COLUMN picture SET DEFAULT 'default-picture.jpg';


/////  Userni ishlatish

select * from users






INSERT INTO eduinfos(edu_name , study_year,  degree,   specialty , user_id) VALUES (....)