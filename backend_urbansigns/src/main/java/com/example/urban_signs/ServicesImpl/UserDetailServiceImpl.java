package com.example.urban_signs.ServicesImpl;

import java.util.HashSet;
import java.util.Set;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.example.urban_signs.Model.UsersModel;
import com.example.urban_signs.Repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserDetailServiceImpl implements UserDetailsService {
    private final UsersRepository usersRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UsersModel userEntity=usersRepository.getByLogin(username)
                .orElseThrow(() -> new UsernameNotFoundException("El usuario "+username+" no existe"));

        Set<GrantedAuthority> authorities = new HashSet<>();

        userEntity.getRoles().stream()
                .filter(role -> role.isState())
                .forEach(role -> {
                    authorities.add(new SimpleGrantedAuthority("ROLE_".concat(role.getName_role())));
                    role.getPermisos().stream()
                            .filter(permiso -> permiso.isEstado())
                            .map(permiso -> new SimpleGrantedAuthority(permiso.getCodigo()))
                            .forEach(authorities::add);
                });
        return new User(userEntity.getUserAcces(),userEntity.getPasswordAcces(),
                userEntity.isState_user(),
                true,
                true,
                true,
                authorities
        );
    }
}
