function r = myRSA5_F(ms,key,keyType)
    % simple RSA public key encryption example
    % Richard K. Herz, www.reactorlab.net, github.com/RichardHerz
    %
    % input ms is message char string which is converted below to a 
    % numeric array of ASCII/UNICODE values
    %
    % from Help on char() 
    % The integers from 32 to 127 correspond to printable ASCII characters. However, the 
    % integers from 0 to 65535 also correspond to Unicode characters. You can convert 
    % integers to their corresponding Unicode representations using the char function. 
    %
    hexlen = 5; % length of each hex value in encoded message
    %
    % hexlen value of 3 can handle unicode values up to 4095
    % hexlen value of 4 can handle max unicode value of 65535 
    % hexlen value of 5 can handle max code value of 1048575 
    %
    % WARNING: note that encoded value of even low value plain text char 
    %          may be large value that needs large hexlen, especially
    %          with large key values
    %
    % each character in plain text message is encoded separately 
    % this is not done in practice because frequency analysis and other
    % techniques can be used to help break code 
    % but it's what we do for simple example
    % and may be OK for short transaction messages by different people
    % in same blockchain block 
    %
    % input keyType = 'public' for public key for encoding
    %         = 'private' for private (secret) key decoding
    % input ms for encode is plain text char array
    %    output for encode is a char array containing hex values of encoded
    %    message
    % input ms for decode is char array containing hex values of encoded message
    %    output for decode is plain text char array 

    % fprintf('function: ms = %s \n',ms)
    % fprintf('function: keyType = %s \n',keyType)

    if (keyType == 'pk')
        % fprintf('in func, top keyType pk check = %s \n',keyType)
        % convert plain text message to array of numeric ascii codes
        for i = 1:length(ms)
            ch = double(ms(i));
            mn(i) = ch;
        end

    elseif (keyType == 'sk')
       % fprintf('in func, top keyType sk check = %s \n',keyType)
       % convert message to array of numeric encrypted code values
       % ms is char array of hex values with no spaces
       % for encoded ascii values here (to 4095) hex is 3 char long
       j = 0; % initialize index
       for i = 1:hexlen:length(ms)-(hexlen-1)
          j = j+1;
          mn(j) = hex2dec( ms(i:i+(hexlen-1)) );
       end
    else
        fprintf('function: bad keyType \n')
    end

    % convert key(2) to binary char array
    % so we know which square terms in array p we need in modular exponentiation
    b = dec2bin(key(2));
    blen = length(b);
    % increasing index in p is higher power-of-two
    % increasing index in b is lower power-of-two
    % flip order of b to match index of powers-of-two in p
    b = flip(b); % WARNING: do not move down into loop, do once here

    % encode each message value separately
    % not done in practice but what we do for simple example 

    for n = 1:length(mn)
        % modular exponentiation routine
        % get result r(n,1) = mn(n)^key(2) mod key(1)
        p = mn(n);
        for i = 2:blen
            p(i) = mod( p(i-1)^2 , key(1) );
        end
        % compute result using the p(i) required by key(2)
        % use only the powers-of-two of bit values in flipped b == '1'
        C = 1; % initialize product
        for i = 1:blen
          if (b(i) == '1')
             C = mod(C, key(1)) * mod(p(i), key(1));
             C = mod(C, key(1));
          end
        end
        %printf('in func, C = %g \n',C)
        r(n,1) = C;
    end

    if (keyType == 'sk')
        % fprintf('in func, btm keyType sk check = %s \n',keyType)
        % orig message hex code
        % convert to ascii char string
        for i = 1:length(r)
           R(i) = char(r(i)); 
        end
        r = R';
    end

    if (keyType == 'pk')
        % fprintf('in func, btm keyType pk check = %s \n',keyType)
        % orig message is plain text
        % return hex code
        % first, dec2hex entire array so get values of same # char
        % if do separately, get hex values of different # char
        rh = dec2hex(r);
        % concatenate into one string
        R = '';
        [row col] = size(rh); % hex values in rows
        % pad all hex values if needed so each hexlen char long
        % then concatenate so one continuous string
        for i = 1:row
            h = rh(i,:);
            while (length(h) < hexlen)
               h = cat(2, '0', h);
            end
           R = cat(2, R, h);
        end
        r = R;
    end

    % final r is returned

