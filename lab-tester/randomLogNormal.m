
for j = 1:1000

u1(j) = rand;
u2(j) = rand;
z1(j) = sqrt(-2*log(u1(j))) * cos(2*pi*u2(j));

end

% figure(1)
% plot(z1,'bo')
% title('the list of z1 values in order generated')
% ylabel('z1 value')
% xlabel('z1 array index > sequence of generation')

% figure(2)
% hist(z1,100)
% title('histogram of 1000 z1 values in 100 boxes') 

%% log normal

% x = z1*sigma + mu 

sigma = 0.5;
mu = 0.5;

x = z1*sigma + mu;
y = exp(x);

figure(3)
hist(y,100)
title('histogram of 1000 y values in 100 boxes') 

